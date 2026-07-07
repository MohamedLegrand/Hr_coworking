"""
Endpoints du module notifications.
"""

import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.v1.modules.notifications import service
from app.api.v1.modules.notifications.schemas import MessageReponse, NotificationReponse
from app.noyau.base_donnees import get_db
from app.noyau.dependances import get_utilisateur_courant

router = APIRouter()


@router.get("/mes-notifications", response_model=list[NotificationReponse])
def mes_notifications(
    non_lues_seulement: bool = Query(False),
    db: Session = Depends(get_db),
    utilisateur=Depends(get_utilisateur_courant),
):
    """
    Liste les notifications de l'utilisateur connecté, de la plus récente
    à la plus ancienne. Paramètre optionnel : non_lues_seulement=true.
    """
    return service.lister_mes_notifications(
        db, str(utilisateur.id), non_lues_seulement
    )


@router.patch(
    "/mes-notifications/{notification_id}/lire",
    response_model=NotificationReponse,
)
def marquer_comme_lue(
    notification_id: uuid.UUID,
    db: Session = Depends(get_db),
    utilisateur=Depends(get_utilisateur_courant),
):
    """Marque une notification précise comme lue."""
    return service.marquer_comme_lue(
        db, str(notification_id), str(utilisateur.id)
    )


@router.patch("/mes-notifications/tout-lire", response_model=MessageReponse)
def tout_marquer_comme_lu(
    db: Session = Depends(get_db),
    utilisateur=Depends(get_utilisateur_courant),
):
    """Marque toutes les notifications non lues comme lues d'un seul coup."""
    nombre = service.tout_marquer_comme_lu(db, str(utilisateur.id))
    return MessageReponse(
        message=f"{nombre} notification(s) marquée(s) comme lue(s)."
    )


@router.delete(
    "/mes-notifications/{notification_id}",
    status_code=204,
)
def supprimer_notification(
    notification_id: uuid.UUID,
    db: Session = Depends(get_db),
    utilisateur=Depends(get_utilisateur_courant),
):
    """Supprime définitivement une notification de l'utilisateur connecté."""
    service.supprimer_notification(db, str(notification_id), str(utilisateur.id))


@router.delete("/mes-notifications", response_model=MessageReponse)
def supprimer_toutes_notifications(
    db: Session = Depends(get_db),
    utilisateur=Depends(get_utilisateur_courant),
):
    """Supprime définitivement toutes les notifications de l'utilisateur connecté."""
    nombre = service.supprimer_toutes_notifications(db, str(utilisateur.id))
    return MessageReponse(message=f"{nombre} notification(s) supprimée(s).")
