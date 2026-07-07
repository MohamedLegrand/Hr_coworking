"""
Logique métier du module administration.
Vue transversale sur tous les modules : utilisateurs, espaces,
réservations, paiements.
"""

from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.v1.modules.authentification.modeles import Utilisateur
from app.api.v1.modules.espaces.modeles import Espace
from app.api.v1.modules.paiements.modeles import Paiement
from app.api.v1.modules.reservations.modeles import Reservation


def lister_utilisateurs(
    db: Session,
    type_compte: str | None = None,
    document_statut: str | None = None,
    est_actif: bool | None = None,
) -> list[Utilisateur]:
    requete = db.query(Utilisateur)

    if type_compte:
        requete = requete.filter(Utilisateur.type_compte == type_compte)
    if document_statut:
        requete = requete.filter(Utilisateur.document_statut == document_statut)
    if est_actif is not None:
        requete = requete.filter(Utilisateur.est_actif == est_actif)

    return requete.order_by(Utilisateur.date_creation.desc()).all()


def valider_document(
    db: Session,
    utilisateur_id: str,
    nouveau_statut: str,
) -> Utilisateur:
    utilisateur = db.query(Utilisateur).filter(
        Utilisateur.id == utilisateur_id
    ).first()

    if not utilisateur:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utilisateur introuvable.",
        )

    if nouveau_statut not in ("valide", "invalide"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Statut invalide. Valeurs acceptées : valide, invalide.",
        )

    utilisateur.document_statut = nouveau_statut
    db.commit()
    db.refresh(utilisateur)
    return utilisateur


def desactiver_utilisateur(db: Session, utilisateur_id: str) -> Utilisateur:
    utilisateur = db.query(Utilisateur).filter(
        Utilisateur.id == utilisateur_id
    ).first()

    if not utilisateur:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utilisateur introuvable.",
        )

    if utilisateur.role == "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Impossible de désactiver un compte administrateur.",
        )

    if not utilisateur.est_actif:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ce compte est déjà désactivé.",
        )

    utilisateur.est_actif = False
    db.commit()
    db.refresh(utilisateur)
    return utilisateur


def reactiver_utilisateur(db: Session, utilisateur_id: str) -> Utilisateur:
    utilisateur = db.query(Utilisateur).filter(
        Utilisateur.id == utilisateur_id
    ).first()

    if not utilisateur:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utilisateur introuvable.",
        )

    if utilisateur.est_actif:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ce compte est déjà actif.",
        )

    utilisateur.est_actif = True
    db.commit()
    db.refresh(utilisateur)
    return utilisateur


def obtenir_statistiques(db: Session) -> dict:
    """Calcule les indicateurs clés du tableau de bord admin."""
    total_utilisateurs = db.query(func.count(Utilisateur.id)).scalar() or 0
    total_freelances = db.query(func.count(Utilisateur.id)).filter(
        Utilisateur.type_compte == "freelance"
    ).scalar() or 0
    total_entreprises = db.query(func.count(Utilisateur.id)).filter(
        Utilisateur.type_compte == "entreprise"
    ).scalar() or 0
    documents_en_attente = db.query(func.count(Utilisateur.id)).filter(
        Utilisateur.document_statut == "en_attente"
    ).scalar() or 0

    total_espaces = db.query(func.count(Espace.id)).scalar() or 0
    espaces_actifs = db.query(func.count(Espace.id)).filter(
        Espace.est_disponible == True  # noqa: E712
    ).scalar() or 0

    total_reservations = db.query(func.count(Reservation.id)).scalar() or 0
    reservations_en_attente = db.query(func.count(Reservation.id)).filter(
        Reservation.statut == "en_attente"
    ).scalar() or 0
    reservations_confirmees = db.query(func.count(Reservation.id)).filter(
        Reservation.statut == "confirmee"
    ).scalar() or 0
    reservations_annulees = db.query(func.count(Reservation.id)).filter(
        Reservation.statut == "annulee"
    ).scalar() or 0

    revenus_total = db.query(func.sum(Paiement.montant_net)).filter(
        Paiement.statut == "SUCCESS"
    ).scalar() or Decimal("0")

    total_paiements_success = db.query(func.count(Paiement.id)).filter(
        Paiement.statut == "SUCCESS"
    ).scalar() or 0

    return {
        "total_utilisateurs": total_utilisateurs,
        "total_freelances": total_freelances,
        "total_entreprises": total_entreprises,
        "documents_en_attente": documents_en_attente,
        "total_espaces": total_espaces,
        "espaces_actifs": espaces_actifs,
        "total_reservations": total_reservations,
        "reservations_en_attente": reservations_en_attente,
        "reservations_confirmees": reservations_confirmees,
        "reservations_annulees": reservations_annulees,
        "revenus_total": Decimal(str(revenus_total)),
        "total_paiements_success": total_paiements_success,
    }
