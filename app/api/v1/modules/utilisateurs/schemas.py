"""
Schémas Pydantic du module utilisateurs.
"""

import uuid
from datetime import datetime
from enum import Enum

from pydantic import BaseModel, EmailStr


class TypeCompte(str, Enum):
    freelance = "freelance"
    entreprise = "entreprise"


class StatutDocument(str, Enum):
    en_attente = "en_attente"
    valide = "valide"
    invalide = "invalide"


class ProfilReponse(BaseModel):
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


class ChangementMotDePasse(BaseModel):
    ancien_mot_de_passe: str
    nouveau_mot_de_passe: str


class MessageReponse(BaseModel):
    message: str
