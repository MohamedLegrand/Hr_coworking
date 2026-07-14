"""
Modèle SQLAlchemy de la table `notifications`.
"""

import uuid

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import UUID

from app.noyau.base_donnees import Base


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    utilisateur_id = Column(
        UUID(as_uuid=True), ForeignKey("utilisateurs.id"), nullable=False
    )
    type = Column(String(30), nullable=False)  # confirmation | rappel | annulation | reservation_creee | paiement_recu
    titre = Column(String(150), nullable=False)
    contenu = Column(Text, nullable=False)
    est_lu = Column(Boolean, nullable=False, default=False)
    date_envoi = Column(DateTime(timezone=True), server_default=func.now())
