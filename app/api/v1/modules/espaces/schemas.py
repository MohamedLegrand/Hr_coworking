"""
Schémas Pydantic du module espaces.

Le bureau n'a pas de prix propre : le prix dépend du forfait (gamme x durée)
choisi par le client à la réservation — voir reservations/forfaits.py.
"""

import uuid
from datetime import datetime
from enum import Enum

from pydantic import BaseModel


class TypeEspace(str, Enum):
    bureau_individuel = "bureau_individuel"
    salle_reunion = "salle_reunion"
    open_space = "open_space"


class EspaceReponse(BaseModel):
    id: uuid.UUID
    nom: str
    type_espace: TypeEspace
    capacite: int
    description: str | None = None
    localisation: str | None = None
    image_url: str | None = None
    est_disponible: bool
    date_creation: datetime

    model_config = {"from_attributes": True}
