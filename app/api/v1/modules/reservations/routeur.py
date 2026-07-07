"""
Endpoints du module reservations.
"""

import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.v1.modules.reservations import service
from app.api.v1.modules.reservations.schemas import ReservationCreation, ReservationReponse
from app.noyau.base_donnees import get_db
from app.noyau.dependances import get_administrateur_courant, get_utilisateur_courant

router = APIRouter()


@router.post("/", response_model=ReservationReponse, status_code=201)
def creer_reservation(
    donnees: ReservationCreation,
    db: Session = Depends(get_db),
    utilisateur=Depends(get_utilisateur_courant),
):
    """
    Crée une réservation pour un ou plusieurs bureaux.
    - Freelance : 1 seul bureau autorisé
    - Entreprise : plusieurs bureaux autorisés en une transaction
    - Statut initial : en_attente (confirmee après paiement)
    """
    return service.creer_reservation(db, utilisateur, donnees.details)


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
