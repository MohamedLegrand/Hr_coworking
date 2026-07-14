"""ajout de visible_plan_3d sur espaces

Revision ID: f6a7b8c9d0e1
Revises: e5f6a7b8c9d0
Create Date: 2026-07-13

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "f6a7b8c9d0e1"
down_revision: Union[str, None] = "e5f6a7b8c9d0"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "espaces",
        sa.Column("visible_plan_3d", sa.Boolean(), nullable=False, server_default=sa.true()),
    )
    op.alter_column("espaces", "visible_plan_3d", server_default=None)


def downgrade() -> None:
    op.drop_column("espaces", "visible_plan_3d")
