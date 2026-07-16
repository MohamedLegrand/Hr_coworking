"""
Schémas Pydantic du module paiements.
"""

import uuid
from datetime import datetime
from decimal import Decimal
from enum import Enum

from pydantic import BaseModel, model_validator


class OperateurPaiement(str, Enum):
    mtn = "MTN"
    orange = "ORANGE"


class StatutPaiement(str, Enum):
    pending = "PENDING"
    success = "SUCCESS"
    failed = "FAILED"
    hold = "HOLD"


class PaiementInitiation(BaseModel):
    reservation_id: uuid.UUID
    operateur: OperateurPaiement
    numero_telephone: str | None = None
    description: str | None = None

    @model_validator(mode="after")
    def _valider_numero_telephone(self):
        if not self.numero_telephone:
            raise ValueError("Le numéro de téléphone est obligatoire pour un paiement Mobile Money.")
        return self


class WebhookHRSkillsPay(BaseModel):
    transaction_id: str
    reference: str
    status: str
    amount: Decimal
    fee: Decimal
    net_amount: Decimal
    operator: str
    phone_number: str


class PaiementReponse(BaseModel):
    id: uuid.UUID
    id_transaction: str | None = None
    reference: str
    reservation_id: uuid.UUID
    utilisateur_id: uuid.UUID
    direction: str
    montant: Decimal
    frais: Decimal
    montant_net: Decimal | None = None
    devise: str
    operateur: str | None = None
    numero_telephone: str | None = None
    statut: StatutPaiement
    description: str | None = None
    cree_le: datetime
    mis_a_jour_le: datetime

    model_config = {"from_attributes": True}


class MessageReponse(BaseModel):
    message: str
