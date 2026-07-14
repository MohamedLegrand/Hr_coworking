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


class GammeReservation(str, Enum):
    """Pour le moment, seule la gamme standard est disponible (VIP à venir)."""
    standard = "standard"


class ForfaitReservation(str, Enum):
    heure = "heure"
    jour = "jour"
    semaine = "semaine"
    mois = "mois"


class ReservationCreation(BaseModel):
    """
    La gamme et le forfait sont choisis par le client pour l'ensemble de la
    réservation (pas par bureau) : le prix est le tarif forfaitaire fixe
    (gamme x forfait), appliqué à chaque bureau sélectionné. La date de fin
    est calculée côté serveur à partir du forfait — jamais fournie par le
    client.
    """

    espace_ids: list[uuid.UUID]
    gamme: GammeReservation
    forfait: ForfaitReservation
    date_debut: datetime

    @model_validator(mode="after")
    def verifier_espaces(self):
        if not self.espace_ids:
            raise ValueError("Au moins un bureau doit être sélectionné.")
        return self


class ForfaitReponse(BaseModel):
    gamme: GammeReservation
    forfait: ForfaitReservation
    prix: Decimal
    prestations: list[str]
    meilleure_valeur: bool = False


class ValidationCguKycEntree(BaseModel):
    cgu_acceptees: bool


class IndisponibiliteReponse(BaseModel):
    """Période exacte d'occupation d'un bureau déjà réservé sur le créneau demandé."""
    espace_id: uuid.UUID
    date_debut: datetime
    date_fin: datetime

    model_config = {"from_attributes": True}


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
    gamme: GammeReservation
    forfait: ForfaitReservation
    prix_total: Decimal
    cgu_acceptees: bool
    date_acceptation_cgu: datetime | None = None
    date_creation: datetime
    date_annulation: datetime | None = None
    details: list[DetailReservationReponse] = []

    model_config = {"from_attributes": True}
