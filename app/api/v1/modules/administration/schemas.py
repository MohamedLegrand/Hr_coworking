"""
Schémas Pydantic du module administration.
"""

import uuid
from datetime import datetime
from decimal import Decimal
from enum import Enum

from pydantic import BaseModel, EmailStr


class StatutDocument(str, Enum):
    en_attente = "en_attente"
    valide = "valide"
    invalide = "invalide"


class TypeCompte(str, Enum):
    freelance = "freelance"
    entreprise = "entreprise"


class ValidationDocumentEntree(BaseModel):
    statut: StatutDocument


class UtilisateurAdminReponse(BaseModel):
    id: uuid.UUID
    email: EmailStr
    nom: str
    prenom: str
    telephone: str | None = None
    type_compte: TypeCompte
    nom_entreprise: str | None = None
    role: str
    document_statut: StatutDocument
    document_entreprise_url: str | None = None
    cni_url: str | None = None
    document_date_upload: datetime | None = None
    date_creation: datetime
    est_actif: bool

    model_config = {"from_attributes": True}


class StatistiquesReponse(BaseModel):
    total_utilisateurs: int
    total_freelances: int
    total_entreprises: int
    documents_en_attente: int
    total_espaces: int
    espaces_actifs: int
    total_reservations: int
    reservations_en_attente: int
    reservations_confirmees: int
    reservations_annulees: int
    revenus_total: Decimal
    total_paiements_success: int


class MessageReponse(BaseModel):
    message: str
