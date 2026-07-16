"""
Endpoints du module paiements.
"""

import uuid

from fastapi import APIRouter, Depends, Header, HTTPException, Request, status
from hrpay import construct_event
from hrpay.errors import WebhookSignatureError
from sqlalchemy.orm import Session

from app.api.v1.modules.paiements import service
from app.api.v1.modules.paiements.schemas import (
    MessageReponse,
    PaiementInitiation,
    PaiementReponse,
)
from app.noyau.base_donnees import get_db
from app.noyau.configuration import settings
from app.noyau.dependances import get_administrateur_courant, get_utilisateur_courant

router = APIRouter()


@router.post("/initier", response_model=PaiementReponse, status_code=201)
def initier_paiement(
    donnees: PaiementInitiation,
    db: Session = Depends(get_db),
    utilisateur=Depends(get_utilisateur_courant),
):
    """
    Initie un paiement CASHIN via HR-Skills Pay (MTN ou Orange Mobile Money).
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
async def webhook_hrskillspay(
    request: Request,
    x_hub_signature: str | None = Header(None, alias="X-Hub-Signature"),
    db: Session = Depends(get_db),
):
    """
    Endpoint appelé par HR-Skills Pay lors d'un changement de statut.

    Pas d'authentification JWT : la légitimité de l'appel est prouvée par la
    signature HMAC-SHA256 du corps BRUT (header X-Hub-Signature).

    construct_event() vérifie la signature ET parse l'événement en une seule
    opération — impossible d'oublier la vérification. Toute requête dont la
    signature ne correspond pas est rejetée en 401, y compris si le corps a
    été altéré ou si le webhook secret n'est pas configuré.
    """
    corps_brut = await request.body()

    try:
        evenement = construct_event(
            corps_brut,
            x_hub_signature or "",
            settings.HR_SKILLS_PAY_WEBHOOK_SECRET,
        )
    except WebhookSignatureError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Webhook rejeté : signature invalide ({e}).",
        )

    resultat = service.traiter_webhook(db, evenement.type_value, evenement.data)
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


@router.post("/{paiement_id}/synchroniser", response_model=PaiementReponse)
def synchroniser_paiement(
    paiement_id: uuid.UUID,
    db: Session = Depends(get_db),
    utilisateur=Depends(get_utilisateur_courant),
):
    """
    Force la vérification du statut auprès de HR-Skills Pay.
    Filet de sécurité si le webhook n'est jamais arrivé.
    L'utilisateur ne peut synchroniser que ses propres paiements.
    """
    service.obtenir_paiement(db, str(paiement_id), str(utilisateur.id))
    return service.synchroniser_statut(db, str(paiement_id))
