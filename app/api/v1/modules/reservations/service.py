"""
Logique métier du module reservations.

Règles métier clés :
- Freelance : 1 seul bureau par réservation
- Entreprise : plusieurs bureaux autorisés en une seule transaction
- Vérification des chevauchements de dates par bureau
- Calcul automatique du prix selon la durée (heure vs journée)
- Statut initial : en_attente (confirmee après paiement)
- Annulation → notification envoyée à l'utilisateur
"""

from datetime import datetime, timezone
from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.api.v1.modules.authentification.modeles import Utilisateur
from app.api.v1.modules.espaces.modeles import Espace
from app.api.v1.modules.notifications.service import notifier_annulation_reservation
from app.api.v1.modules.reservations.modeles import Reservation, ReservationDetail
from app.api.v1.modules.reservations.schemas import DetailReservationEntree


def _verifier_chevauchement(
    db: Session,
    espace_id: str,
    date_debut: datetime,
    date_fin: datetime,
    exclure_reservation_id: str | None = None,
) -> None:
    requete = (
        db.query(ReservationDetail)
        .join(Reservation)
        .filter(
            ReservationDetail.espace_id == espace_id,
            Reservation.statut.in_(["en_attente", "confirmee"]),
            ReservationDetail.date_debut < date_fin,
            ReservationDetail.date_fin > date_debut,
        )
    )
    if exclure_reservation_id:
        requete = requete.filter(Reservation.id != exclure_reservation_id)
    if requete.first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="L'espace est déjà réservé sur cette période.",
        )


def _calculer_prix(
    espace: Espace,
    date_debut: datetime,
    date_fin: datetime,
) -> Decimal:
    duree_heures = (date_fin - date_debut).total_seconds() / 3600
    if duree_heures >= 8 and espace.prix_jour is not None:
        nombre_jours = max(1, round(duree_heures / 8))
        return Decimal(str(espace.prix_jour)) * nombre_jours
    if espace.prix_heure is not None:
        return Decimal(str(espace.prix_heure)) * Decimal(str(round(duree_heures, 2)))
    return Decimal("0")


def creer_reservation(
    db: Session,
    utilisateur,
    details: list[DetailReservationEntree],
) -> Reservation:
    if utilisateur.type_compte == "freelance" and len(details) > 1:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Un compte freelance ne peut réserver qu'un seul bureau à la fois.",
        )

    prix_total = Decimal("0")
    items = []

    for detail in details:
        espace = db.query(Espace).filter(
            Espace.id == str(detail.espace_id),
            Espace.est_disponible == True,  # noqa: E712
        ).first()

        if not espace:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"L'espace {detail.espace_id} est introuvable ou indisponible.",
            )

        _verifier_chevauchement(
            db,
            espace_id=str(detail.espace_id),
            date_debut=detail.date_debut,
            date_fin=detail.date_fin,
        )

        prix = _calculer_prix(espace, detail.date_debut, detail.date_fin)
        prix_total += prix

        items.append(ReservationDetail(
            espace_id=detail.espace_id,
            date_debut=detail.date_debut,
            date_fin=detail.date_fin,
            prix=prix,
        ))

    nouvelle_reservation = Reservation(
        utilisateur_id=utilisateur.id,
        statut="en_attente",
        prix_total=prix_total,
    )
    db.add(nouvelle_reservation)
    db.flush()

    for item in items:
        item.reservation_id = nouvelle_reservation.id
        db.add(item)

    db.commit()
    db.refresh(nouvelle_reservation)
    return nouvelle_reservation


def lister_mes_reservations(db: Session, utilisateur_id: str) -> list[Reservation]:
    return (
        db.query(Reservation)
        .filter(Reservation.utilisateur_id == utilisateur_id)
        .order_by(Reservation.date_creation.desc())
        .all()
    )


def obtenir_reservation(
    db: Session,
    reservation_id: str,
    utilisateur_id: str | None = None,
) -> Reservation:
    requete = db.query(Reservation).filter(Reservation.id == reservation_id)
    if utilisateur_id:
        requete = requete.filter(Reservation.utilisateur_id == utilisateur_id)
    reservation = requete.first()
    if not reservation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Réservation introuvable.",
        )
    return reservation


def annuler_reservation(
    db: Session,
    reservation_id: str,
    utilisateur_id: str,
) -> Reservation:
    """Annule une réservation et envoie une notification à l'utilisateur."""
    reservation = obtenir_reservation(db, reservation_id, utilisateur_id)

    if reservation.statut == "annulee":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cette réservation est déjà annulée.",
        )

    reservation.statut = "annulee"
    reservation.date_annulation = datetime.now(timezone.utc)
    db.commit()
    db.refresh(reservation)

    utilisateur = db.query(Utilisateur).filter(
        Utilisateur.id == utilisateur_id
    ).first()

    if utilisateur:
        notifier_annulation_reservation(
            db,
            utilisateur_id=utilisateur_id,
            email_utilisateur=utilisateur.email,
            reservation_id=reservation_id,
        )

    return reservation


def lister_toutes_reservations(db: Session) -> list[Reservation]:
    return (
        db.query(Reservation)
        .order_by(Reservation.date_creation.desc())
        .all()
    )


def confirmer_reservation(db: Session, reservation_id: str) -> Reservation:
    """
    Passe le statut à 'confirmee'.
    Appelé par le module paiements après webhook SUCCESS.
    Ne pas exposer directement en endpoint public.
    """
    reservation = db.query(Reservation).filter(
        Reservation.id == reservation_id
    ).first()
    if not reservation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Réservation introuvable.",
        )
    reservation.statut = "confirmee"
    db.commit()
    db.refresh(reservation)
    return reservation
