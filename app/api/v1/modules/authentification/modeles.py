import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, Enum, String, Text
from sqlalchemy.dialects.postgresql import UUID

from app.noyau.base_donnees import Base


class Utilisateur(Base):
    __tablename__ = "utilisateurs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    mot_de_passe_hash = Column(String(255), nullable=False)
    nom = Column(String(100), nullable=False)
    prenom = Column(String(100), nullable=False)
    telephone = Column(String(20), nullable=True)
    type_compte = Column(
        Enum("freelance", "entreprise", name="type_compte"),
        nullable=False,
    )
    nom_entreprise = Column(String(200), nullable=True)
    role = Column(
        Enum("membre", "admin", name="role_utilisateur"),
        nullable=False,
        default="membre",
    )
    cni_url = Column(Text, nullable=True)
    document_entreprise_url = Column(Text, nullable=True)
    document_statut = Column(
        Enum("en_attente", "valide", "invalide", name="statut_document"),
        nullable=False,
        default="en_attente",
    )
    document_date_upload = Column(DateTime(timezone=True), nullable=True)
    date_creation = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    est_actif = Column(Boolean, default=True, nullable=False)
