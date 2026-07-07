"""
Schémas Pydantic du module espaces.
"""

import uuid
from datetime import datetime
from decimal import Decimal
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
    prix_heure: Decimal | None = None
    prix_jour: Decimal | None = None
    description: str | None = None
    localisation: str | None = None
    image_url: str | None = None
    est_disponible: bool
    date_creation: datetime

    model_config = {"from_attributes": True}
