"""
Endpoints du module paiements.
"""

import uuid

from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.api.v1.modules.paiements import service
from app.api.v1.modules.paiements.schemas import (
    MessageReponse,
    PaiementInitiation,
    PaiementReponse,
)
from app.noyau.base_donnees import get_db
from app.noyau.dependances import get_administrateur_courant, get_utilisateur_courant

router = APIRouter()


@router.post("/initier", response_model=PaiementReponse, status_code=201)
def initier_paiement(
    donnees: PaiementInitiation,
    db: Session = Depends(get_db),
    utilisateur=Depends(get_utilisateur_courant),
):
    """
    Initie un paiement CASHIN via HR-Skills Pay (MTN, Orange Mobile Money ou carte bancaire).
    La réservation passe à 'confirmee' uniquement après le webhook SUCCESS.
    """
    return service.initier_paiement(
        db,
        utilisateur_id=str(utilisateur.id),
        reservation_id=str(donnees.reservation_id),
        operateur=donnees.operateur.value,
        numero_telephone=donnees.numero_telephone,
        description=donnees.description,
    )


@router.post("/webhook", response_model=MessageReponse)
async def webhook_hrskillspay(request: Request, db: Session = Depends(get_db)):
    """
    Endpoint appelé directement par HR-Skills Pay après traitement du paiement.
    Pas d'authentification JWT — sécurisé par IP whitelist côté serveur (production).
    """
    payload = await request.json()
    resultat = service.traiter_webhook(db, payload)
    return MessageReponse(message=resultat["message"])


@router.get("/mes-paiements", response_model=list[PaiementReponse])
def mes_paiements(
    db: Session = Depends(get_db),
    utilisateur=Depends(get_utilisateur_courant),
):
    """Liste tous les paiements de l'utilisateur connecté."""
    return service.lister_mes_paiements(db, str(utilisateur.id))


@router.get("/admin/tous", response_model=list[PaiementReponse])
def tous_les_paiements(
    db: Session = Depends(get_db),
    _admin=Depends(get_administrateur_courant),
):
    """Vue admin : tous les paiements de tous les utilisateurs."""
    return service.lister_tous_paiements(db)


@router.get("/admin/{paiement_id}", response_model=PaiementReponse)
def obtenir_paiement_admin(
    paiement_id: uuid.UUID,
    db: Session = Depends(get_db),
    _admin=Depends(get_administrateur_courant),
):
    """Vue admin : détail d'un paiement quelconque, sans restriction d'appartenance."""
    return service.obtenir_paiement(db, str(paiement_id))


@router.get("/{paiement_id}", response_model=PaiementReponse)
def obtenir_paiement(
    paiement_id: uuid.UUID,
    db: Session = Depends(get_db),
    utilisateur=Depends(get_utilisateur_courant),
):
    """Détail d'un paiement appartenant à l'utilisateur connecté."""
    return service.obtenir_paiement(db, str(paiement_id), str(utilisateur.id))
