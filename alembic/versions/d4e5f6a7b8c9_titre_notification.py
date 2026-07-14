"""ajout du titre sur les notifications + nouveaux types

Revision ID: d4e5f6a7b8c9
Revises: c3d4e5f6a7b8
Create Date: 2026-07-13

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "d4e5f6a7b8c9"
down_revision: Union[str, None] = "c3d4e5f6a7b8"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "notifications",
        sa.Column("titre", sa.String(150), nullable=False, server_default="Notification"),
    )
    op.alter_column("notifications", "titre", server_default=None)
    op.alter_column("notifications", "type", type_=sa.String(30))


def downgrade() -> None:
    op.alter_column("notifications", "type", type_=sa.String(20))
    op.drop_column("notifications", "titre")
