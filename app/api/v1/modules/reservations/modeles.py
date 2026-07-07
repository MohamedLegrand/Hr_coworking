"""
Modèles SQLAlchemy des tables `reservations` et `reservation_details`.
"""

import uuid

from sqlalchemy import Column, DateTime, ForeignKey, Numeric, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.noyau.base_donnees import Base


class Reservation(Base):
    __tablename__ = "reservations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    utilisateur_id = Column(UUID(as_uuid=True), ForeignKey("utilisateurs.id"), nullable=False)
    statut = Column(String(20), nullable=False, default="en_attente")
    prix_total = Column(Numeric(15, 2), nullable=False, default=0)
    date_creation = Column(DateTime(timezone=True), server_default=func.now())
    date_annulation = Column(DateTime(timezone=True), nullable=True)

    details = relationship(
        "ReservationDetail",
        back_populates="reservation",
        cascade="all, delete-orphan",
    )


class ReservationDetail(Base):
    __tablename__ = "reservation_details"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    reservation_id = Column(
        UUID(as_uuid=True), ForeignKey("reservations.id"), nullable=False
    )
    espace_id = Column(UUID(as_uuid=True), ForeignKey("espaces.id"), nullable=False)
    date_debut = Column(DateTime(timezone=True), nullable=False)
    date_fin = Column(DateTime(timezone=True), nullable=False)
    prix = Column(Numeric(15, 2), nullable=False)

    reservation = relationship("Reservation", back_populates="details")
    espace = relationship("Espace", foreign_keys=[espace_id])
