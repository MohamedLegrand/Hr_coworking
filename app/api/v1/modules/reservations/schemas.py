"""
Schémas Pydantic du module reservations.
"""

import uuid
from datetime import datetime
from decimal import Decimal
from enum import Enum

from pydantic import BaseModel, model_validator


class StatutReservation(str, Enum):
    en_attente = "en_attente"
    confirmee = "confirmee"
    annulee = "annulee"


class DetailReservationEntree(BaseModel):
    espace_id: uuid.UUID
    date_debut: datetime
    date_fin: datetime

    @model_validator(mode="after")
    def verifier_periode(self):
        if self.date_fin <= self.date_debut:
            raise ValueError("La date de fin doit être après la date de début.")
        return self


class ReservationCreation(BaseModel):
    details: list[DetailReservationEntree]

    @model_validator(mode="after")
    def verifier_details(self):
        if not self.details:
            raise ValueError("Au moins un bureau doit être sélectionné.")
        return self


class DetailReservationReponse(BaseModel):
    id: uuid.UUID
    espace_id: uuid.UUID
    date_debut: datetime
    date_fin: datetime
    prix: Decimal

    model_config = {"from_attributes": True}


class ReservationReponse(BaseModel):
    id: uuid.UUID
    utilisateur_id: uuid.UUID
    statut: StatutReservation
    prix_total: Decimal
    date_creation: datetime
    date_annulation: datetime | None = None
    details: list[DetailReservationReponse] = []

    model_config = {"from_attributes": True}
