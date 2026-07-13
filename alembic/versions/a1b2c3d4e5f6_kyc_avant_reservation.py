"""cni optionnelle a l'inscription + acceptation des conditions avant reservation

Revision ID: a1b2c3d4e5f6
Revises:
Create Date: 2026-07-08

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "a1b2c3d4e5f6"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column("utilisateurs", "cni_url", existing_type=sa.Text(), nullable=True)
    op.add_column(
        "utilisateurs",
        sa.Column("conditions_acceptees", sa.Boolean(), nullable=False, server_default=sa.false()),
    )
    op.add_column(
        "utilisateurs",
        sa.Column("conditions_acceptees_date", sa.DateTime(timezone=True), nullable=True),
    )
    op.alter_column("utilisateurs", "conditions_acceptees", server_default=None)


def downgrade() -> None:
    op.drop_column("utilisateurs", "conditions_acceptees_date")
    op.drop_column("utilisateurs", "conditions_acceptees")
    op.alter_column("utilisateurs", "cni_url", existing_type=sa.Text(), nullable=False)
