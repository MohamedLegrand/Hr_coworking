"""
Schémas Pydantic du module notifications.
"""

import uuid
from datetime import datetime
from enum import Enum

from pydantic import BaseModel


class TypeNotification(str, Enum):
    confirmation = "confirmation"
    rappel = "rappel"
    annulation = "annulation"
    reservation_creee = "reservation_creee"
    paiement_recu = "paiement_recu"


class NotificationReponse(BaseModel):
    id: uuid.UUID
    utilisateur_id: uuid.UUID
    type: TypeNotification
    titre: str
    contenu: str
    est_lu: bool
    date_envoi: datetime

    model_config = {"from_attributes": True}


class MessageReponse(BaseModel):
    message: str
