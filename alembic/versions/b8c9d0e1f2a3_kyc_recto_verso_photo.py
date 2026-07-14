"""KYC détaillé : CNI recto, CNI verso, photo d'identité

Revision ID: b8c9d0e1f2a3
Revises: a7b8c9d0e1f2
Create Date: 2026-07-14

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "b8c9d0e1f2a3"
down_revision: Union[str, None] = "a7b8c9d0e1f2"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column("utilisateurs", "cni_url", new_column_name="cni_recto_url")
    op.add_column("utilisateurs", sa.Column("cni_verso_url", sa.String(), nullable=True))
    op.add_column("utilisateurs", sa.Column("photo_identite_url", sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column("utilisateurs", "photo_identite_url")
    op.drop_column("utilisateurs", "cni_verso_url")
    op.alter_column("utilisateurs", "cni_recto_url", new_column_name="cni_url")
