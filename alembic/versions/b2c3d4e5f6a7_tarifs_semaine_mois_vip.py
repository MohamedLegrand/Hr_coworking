"""ajout prix_semaine, prix_mois et est_vip sur espaces

Revision ID: b2c3d4e5f6a7
Revises: a1b2c3d4e5f6
Create Date: 2026-07-09

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "b2c3d4e5f6a7"
down_revision: Union[str, None] = "a1b2c3d4e5f6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("espaces", sa.Column("prix_semaine", sa.Numeric(15, 2), nullable=True))
    op.add_column("espaces", sa.Column("prix_mois", sa.Numeric(15, 2), nullable=True))
    op.add_column(
        "espaces",
        sa.Column("est_vip", sa.Boolean(), nullable=False, server_default=sa.false()),
    )
    op.alter_column("espaces", "est_vip", server_default=None)


def downgrade() -> None:
    op.drop_column("espaces", "est_vip")
    op.drop_column("espaces", "prix_mois")
    op.drop_column("espaces", "prix_semaine")
