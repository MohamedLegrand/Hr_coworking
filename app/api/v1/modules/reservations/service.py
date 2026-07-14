"""
Logique métier du module reservations.

Règles métier clés :
- Freelance : 1 seul bureau par réservation
- Entreprise : plusieurs bureaux autorisés en une seule transaction
- La gamme est un choix du client, pas une propriété du bureau (pour le
  moment, seule la gamme standard existe) ; le prix est un forfait fixe
  (gamme x durée), jamais une multiplication durée x tarif — voir forfaits.py
- Vérification des chevauchements de dates par bureau
- Statut initial : en_attente (confirmee après paiement)
- Les CGU sont acceptées à chaque réservation (pas au niveau du compte) et
  le KYC (documents du compte) est vérifié juste avant le paiement, pas à
  la création de la réservation — voir valider_cgu_kyc() et le module
  paiements pour le garde-fou avant paiement
- Annulation → notification envoyée à l'utilisateur
"""

import uuid
from datetime import datetime, timezone
from decimal import Decimal

from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.api.v1.modules.authentification.modeles import Utilisateur
from app.api.v1.modules.espaces.modeles import Espace
from app.api.v1.modules.notifications.service import (
    notifier_admins_creation_reservation,
    notifier_annulation_reservation,
    notifier_creation_reservation,
)
from app.api.v1.modules.reservations.forfaits import calculer_date_fin, obtenir_forfait
from app.api.v1.modules.reservations.modeles import Reservation, ReservationDetail
from app.noyau.configuration import settings
from app.noyau.utilitaires_fichiers import sauvegarder_fichier

EXTENSIONS_DOCUMENTS_AUTORISEES = {".pdf", ".jpg", ".jpeg", ".png"}


def _sauvegarder_document(fichier: UploadFile) -> str:
    return sauvegarder_fichier(
        fichier, settings.UPLOAD_DOCUMENTS_DIR, EXTENSIONS_DOCUMENTS_AUTORISEES
    )


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


def creer_reservation(
    db: Session,
    utilisateur,
    espace_ids: list[uuid.UUID],
    gamme: str,
    forfait: str,
    date_debut: datetime,
) -> Reservation:
    """
    Crée la réservation avec le statut 'en_attente', sans vérifier le KYC
    ni les CGU (ces vérifications interviennent juste avant le paiement).
    Le prix est le forfait fixe (gamme, forfait), appliqué à chaque bureau.
    """
    if utilisateur.type_compte == "freelance" and len(espace_ids) > 1:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Un compte freelance ne peut réserver qu'un seul bureau à la fois.",
        )

    donnees_forfait = obtenir_forfait(gamme, forfait)
    prix_unitaire = Decimal(str(donnees_forfait["prix"]))
    date_fin = calculer_date_fin(date_debut, forfait)

    items = []
    noms_bureaux = []
    for espace_id in espace_ids:
        espace = db.query(Espace).filter(
            Espace.id == str(espace_id),
            Espace.est_disponible == True,  # noqa: E712
        ).first()

        if not espace:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"L'espace {espace_id} est introuvable ou indisponible.",
            )

        _verifier_chevauchement(
            db, espace_id=str(espace_id), date_debut=date_debut, date_fin=date_fin,
        )

        noms_bureaux.append(espace.nom)
        items.append(ReservationDetail(
            espace_id=espace_id,
            date_debut=date_debut,
            date_fin=date_fin,
            prix=prix_unitaire,
        ))

    nouvelle_reservation = Reservation(
        utilisateur_id=utilisateur.id,
        statut="en_attente",
        gamme=gamme,
        forfait=forfait,
        prix_total=prix_unitaire * len(items),
        cgu_acceptees=False,
    )
    db.add(nouvelle_reservation)
    db.flush()

    for item in items:
        item.reservation_id = nouvelle_reservation.id
        db.add(item)

    db.commit()
    db.refresh(nouvelle_reservation)

    notifier_creation_reservation(
        db,
        utilisateur_id=str(utilisateur.id),
        email_utilisateur=utilisateur.email,
        reservation_id=str(nouvelle_reservation.id),
        gamme=gamme,
        forfait=forfait,
        nombre_bureaux=len(items),
        prix_total=str(nouvelle_reservation.prix_total),
    )

    notifier_admins_creation_reservation(
        db,
        reservation_id=str(nouvelle_reservation.id),
        noms_bureaux=noms_bureaux,
        date_debut=date_debut,
        date_fin=date_fin,
        client_nom=utilisateur.nom,
        client_prenom=utilisateur.prenom,
    )

    return nouvelle_reservation


def valider_cgu_kyc(
    db: Session,
    utilisateur: Utilisateur,
    reservation_id: str,
    cgu_acceptees: bool,
    cni_recto: UploadFile | None = None,
    cni_verso: UploadFile | None = None,
    photo_identite: UploadFile | None = None,
    document_entreprise: UploadFile | None = None,
) -> Reservation:
    """
    Étape obligatoire avant le paiement d'une réservation : acceptation des
    conditions proposées par HR-SKILLS SARL (tracée sur la réservation,
    horodatée) + dépôt des documents KYC si manquants ou refusés (CNI recto,
    CNI verso, photo de la personne qui réserve). Les documents déjà fournis
    et non refusés (statut valide ou en_attente) ne sont pas redemandés.
    """
    reservation = obtenir_reservation(db, reservation_id, str(utilisateur.id))

    if not cgu_acceptees:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vous devez accepter les conditions d'utilisation proposées par HR-SKILLS SARL.",
        )

    if document_entreprise is not None:
        if utilisateur.type_compte != "entreprise":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Le document entreprise ne s'applique qu'aux comptes entreprise.",
            )
        utilisateur.document_entreprise_url = _sauvegarder_document(document_entreprise)

    if cni_recto is not None:
        utilisateur.cni_recto_url = _sauvegarder_document(cni_recto)
    if cni_verso is not None:
        utilisateur.cni_verso_url = _sauvegarder_document(cni_verso)
    if photo_identite is not None:
        utilisateur.photo_identite_url = _sauvegarder_document(photo_identite)

    if cni_recto is not None or cni_verso is not None or photo_identite is not None or document_entreprise is not None:
        utilisateur.document_statut = "en_attente"
        utilisateur.document_date_upload = datetime.now(timezone.utc)

    kyc_manquant_ou_refuse = (
        not utilisateur.cni_recto_url
        or not utilisateur.cni_verso_url
        or not utilisateur.photo_identite_url
        or utilisateur.document_statut == "invalide"
    )
    if kyc_manquant_ou_refuse:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="La CNI (recto et verso) et votre photo sont obligatoires (document manquant ou refusé).",
        )
    if utilisateur.type_compte == "entreprise" and not utilisateur.document_entreprise_url:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Le document entreprise est obligatoire.",
        )

    reservation.cgu_acceptees = True
    reservation.date_acceptation_cgu = datetime.now(timezone.utc)

    db.commit()
    db.refresh(reservation)
    return reservation


def lister_espaces_indisponibles(
    db: Session,
    debut: datetime,
    fin: datetime,
) -> list[ReservationDetail]:
    """
    Détails (bureau, période) des réservations déjà prises (en_attente/confirmée)
    qui chevauchent [debut, fin] — permet d'afficher au client la période exacte
    d'occupation et l'heure à partir de laquelle le bureau redevient libre.
    """
    return (
        db.query(ReservationDetail)
        .join(Reservation)
        .filter(
            Reservation.statut.in_(["en_attente", "confirmee"]),
            ReservationDetail.date_debut < fin,
            ReservationDetail.date_fin > debut,
        )
        .all()
    )


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
