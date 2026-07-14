"""
Modèle SQLAlchemy de la table `espaces`.
"""

import uuid

from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import UUID

from app.noyau.base_donnees import Base


class Espace(Base):
    __tablename__ = "espaces"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nom = Column(String(100), nullable=False)
    type_espace = Column(String(30), nullable=False)
    capacite = Column(Integer, nullable=False, default=1)
    description = Column(Text, nullable=True)
    localisation = Column(String(150), nullable=True)
    image_url = Column(String(255), nullable=True)
    est_disponible = Column(Boolean, nullable=False, default=True)
    date_creation = Column(DateTime(timezone=True), server_default=func.now())
