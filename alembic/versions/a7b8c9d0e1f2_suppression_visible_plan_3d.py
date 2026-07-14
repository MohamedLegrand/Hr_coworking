"""suppression de visible_plan_3d sur espaces (plan 3D retiré)

Revision ID: a7b8c9d0e1f2
Revises: f6a7b8c9d0e1
Create Date: 2026-07-14

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "a7b8c9d0e1f2"
down_revision: Union[str, None] = "f6a7b8c9d0e1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_column("espaces", "visible_plan_3d")


def downgrade() -> None:
    op.add_column(
        "espaces",
        sa.Column("visible_plan_3d", sa.Boolean(), nullable=False, server_default=sa.true()),
    )
    op.alter_column("espaces", "visible_plan_3d", server_default=None)
