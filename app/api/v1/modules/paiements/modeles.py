"""
Modèle SQLAlchemy de la table `paiements`.
Direction toujours CASHIN.
Agrégateur : HR-Skills Pay (Mobile Money MTN / Orange Cameroun).
"""

import uuid

from sqlalchemy import Column, DateTime, ForeignKey, Numeric, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.noyau.base_donnees import Base


class Paiement(Base):
    __tablename__ = "paiements"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    id_transaction = Column(String(100), unique=True, nullable=True)
    reference = Column(String(100), unique=True, nullable=False)
    utilisateur_id = Column(UUID(as_uuid=True), ForeignKey("utilisateurs.id"), nullable=False)
    reservation_id = Column(UUID(as_uuid=True), ForeignKey("reservations.id"), nullable=False)
    direction = Column(String(20), nullable=False, default="CASHIN")
    montant = Column(Numeric(15, 2), nullable=False)
    frais = Column(Numeric(15, 2), nullable=False, default=0)
    montant_net = Column(Numeric(15, 2), nullable=True)
    devise = Column(String(3), nullable=False, default="XAF")
    operateur = Column(String(10), nullable=True)
    pays = Column(String(2), nullable=False, default="CM")
    numero_telephone = Column(String(20), nullable=True)
    statut = Column(String(20), nullable=False, default="PENDING")
    cle_idempotence = Column(String(100), unique=True, nullable=True)
    description = Column(String(120), nullable=True)
    wallet_id = Column(UUID(as_uuid=True), nullable=True)
    cree_le = Column(DateTime(timezone=True), server_default=func.now())
    mis_a_jour_le = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    reservation = relationship("Reservation", foreign_keys=[reservation_id])
