"""Corrige la dérive de schéma : toutes les colonnes de date deviennent
TIMESTAMP WITH TIME ZONE (les modèles SQLAlchemy le déclaraient déjà via
DateTime(timezone=True), mais les colonnes physiques étaient restées
"timestamp without time zone" — stockage silencieusement dépendant du
fuseau de session Postgres, source d'incohérences).

Les données existantes sont réinterprétées comme étant en heure locale
Europe/Paris (fuseau de session confirmé en production/dev à ce jour) et
converties en UTC réel, sans changer la valeur d'horloge murale affichée.

Revision ID: c9d0e1f2a3b4
Revises: b8c9d0e1f2a3
Create Date: 2026-07-14

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "c9d0e1f2a3b4"
down_revision: Union[str, None] = "b8c9d0e1f2a3"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

_FUSEAU_ORIGINE = "Europe/Paris"

_COLONNES = [
    ("espaces", "date_creation"),
    ("utilisateurs", "date_creation"),
    ("utilisateurs", "document_date_upload"),
    ("reservations", "date_creation"),
    ("reservations", "date_annulation"),
    ("reservation_details", "date_debut"),
    ("reservation_details", "date_fin"),
    ("notifications", "date_envoi"),
    ("paiements", "cree_le"),
    ("paiements", "mis_a_jour_le"),
]


def upgrade() -> None:
    for table, colonne in _COLONNES:
        op.alter_column(
            table,
            colonne,
            type_=sa.DateTime(timezone=True),
            postgresql_using=f"{colonne} AT TIME ZONE '{_FUSEAU_ORIGINE}'",
        )


def downgrade() -> None:
    for table, colonne in _COLONNES:
        op.alter_column(
            table,
            colonne,
            type_=sa.DateTime(timezone=False),
            postgresql_using=f"{colonne} AT TIME ZONE '{_FUSEAU_ORIGINE}'",
        )
