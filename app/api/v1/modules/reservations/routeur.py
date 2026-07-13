"""
Endpoints du module reservations.
"""

import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, File, Form, Query, UploadFile
from sqlalchemy.orm import Session

from app.api.v1.modules.reservations import service
from app.api.v1.modules.reservations.forfaits import lister_forfaits
from app.api.v1.modules.reservations.schemas import (
    ForfaitReponse,
    ReservationCreation,
    ReservationReponse,
)
from app.noyau.base_donnees import get_db
from app.noyau.dependances import get_administrateur_courant, get_utilisateur_courant

router = APIRouter()


@router.get("/forfaits", response_model=list[ForfaitReponse])
def forfaits():
    """
    Grille tarifaire de référence : gamme standard x 4 durées
    (heure/jour/semaine/mois) à prix fixe. Public, utilisé pour
    afficher les tarifs avant même de choisir un bureau.
    """
    return lister_forfaits()


@router.post("/", response_model=ReservationReponse, status_code=201)
def creer_reservation(
    donnees: ReservationCreation,
    db: Session = Depends(get_db),
    utilisateur=Depends(get_utilisateur_courant),
):
    """
    Crée une réservation pour un ou plusieurs bureaux, sur la gamme et le
    forfait choisis (prix fixe, date de fin calculée côté serveur).
    - Freelance : 1 seul bureau autorisé. Entreprise : plusieurs en une transaction.
    - Statut initial : en_attente (confirmee après paiement).
    - Ni le KYC ni les CGU ne sont vérifiés ici : voir POST /{id}/valider-cgu-kyc
      et le module paiements, qui vérifie les deux avant d'autoriser le paiement.
    """
    return service.creer_reservation(
        db, utilisateur,
        espace_ids=donnees.espace_ids,
        gamme=donnees.gamme.value,
        forfait=donnees.forfait.value,
        date_debut=donnees.date_debut,
    )


@router.post("/{reservation_id}/valider-cgu-kyc", response_model=ReservationReponse)
def valider_cgu_kyc(
    reservation_id: uuid.UUID,
    cgu_acceptees: bool = Form(...),
    cni: UploadFile | None = File(None, description="Carte Nationale d'Identité"),
    document_entreprise: UploadFile | None = File(
        None, description="RCCM, statuts ou tout justificatif d'entreprise"
    ),
    db: Session = Depends(get_db),
    utilisateur=Depends(get_utilisateur_courant),
):
    """
    Étape obligatoire avant le paiement : acceptation des CGU (tracée sur
    cette réservation précise, horodatée) + dépôt des documents KYC si
    manquants ou refusés. Si les documents sont déjà fournis et non
    refusés, cni/document_entreprise peuvent être omis.
    """
    return service.valider_cgu_kyc(
        db, utilisateur,
        reservation_id=str(reservation_id),
        cgu_acceptees=cgu_acceptees,
        cni=cni,
        document_entreprise=document_entreprise,
    )


@router.get("/indisponibilites", response_model=list[uuid.UUID])
def indisponibilites(
    debut: datetime = Query(...),
    fin: datetime = Query(...),
    db: Session = Depends(get_db),
):
    """
    Liste les espaces déjà réservés (en_attente ou confirmée) qui chevauchent
    la période donnée. Utilisé par le sélecteur de bureaux pour griser en
    temps réel les places indisponibles sur le créneau choisi.
    """
    return service.lister_espaces_indisponibles(db, debut, fin)


@router.get("/mes-reservations", response_model=list[ReservationReponse])
def mes_reservations(
    db: Session = Depends(get_db),
    utilisateur=Depends(get_utilisateur_courant),
):
    """Liste toutes les réservations de l'utilisateur connecté."""
    return service.lister_mes_reservations(db, str(utilisateur.id))


@router.get("/admin/toutes", response_model=list[ReservationReponse])
def toutes_les_reservations(
    db: Session = Depends(get_db),
    _admin=Depends(get_administrateur_courant),
):
    """Vue admin : toutes les réservations de tous les utilisateurs."""
    return service.lister_toutes_reservations(db)


@router.get("/admin/{reservation_id}", response_model=ReservationReponse)
def obtenir_reservation_admin(
    reservation_id: uuid.UUID,
    db: Session = Depends(get_db),
    _admin=Depends(get_administrateur_courant),
):
    """Vue admin : détail d'une réservation quelconque, sans restriction d'appartenance."""
    return service.obtenir_reservation(db, str(reservation_id))


@router.get("/{reservation_id}", response_model=ReservationReponse)
def obtenir_reservation(
    reservation_id: uuid.UUID,
    db: Session = Depends(get_db),
    utilisateur=Depends(get_utilisateur_courant),
):
    """Détail d'une réservation appartenant à l'utilisateur connecté."""
    return service.obtenir_reservation(db, str(reservation_id), str(utilisateur.id))


@router.patch("/{reservation_id}/annuler", response_model=ReservationReponse)
def annuler_reservation(
    reservation_id: uuid.UUID,
    db: Session = Depends(get_db),
    utilisateur=Depends(get_utilisateur_courant),
):
    """Annule une réservation appartenant à l'utilisateur connecté."""
    return service.annuler_reservation(db, str(reservation_id), str(utilisateur.id))
