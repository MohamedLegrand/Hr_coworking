"""
Schémas Pydantic du module authentification.
"""

import uuid
from datetime import datetime
from enum import Enum

from pydantic import BaseModel, EmailStr


class TypeCompte(str, Enum):
    freelance = "freelance"
    entreprise = "entreprise"


class RoleUtilisateur(str, Enum):
    membre = "membre"
    admin = "admin"


class StatutDocument(str, Enum):
    en_attente = "en_attente"
    valide = "valide"
    invalide = "invalide"


class UtilisateurReponse(BaseModel):
    """Ce que l'API renvoie après inscription, connexion, ou pour /moi."""

    id: uuid.UUID
    email: EmailStr
    nom: str
    prenom: str
    telephone: str | None = None
    type_compte: TypeCompte
    nom_entreprise: str | None = None
    role: RoleUtilisateur
    document_statut: StatutDocument
    date_creation: datetime
    est_actif: bool

    model_config = {"from_attributes": True}


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class DemandeMotDePasseOublie(BaseModel):
    email: EmailStr


class ReinitialisationMotDePasse(BaseModel):
    token: str
    nouveau_mot_de_passe: str


class MessageReponse(BaseModel):
    message: str
