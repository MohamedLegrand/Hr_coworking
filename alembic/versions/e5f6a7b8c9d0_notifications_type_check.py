"""elargit la contrainte CHECK sur notifications.type aux nouveaux types

Revision ID: e5f6a7b8c9d0
Revises: d4e5f6a7b8c9
Create Date: 2026-07-13

"""
from typing import Sequence, Union

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "e5f6a7b8c9d0"
down_revision: Union[str, None] = "d4e5f6a7b8c9"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

ANCIENS_TYPES = ("confirmation", "rappel", "annulation")
NOUVEAUX_TYPES = ANCIENS_TYPES + ("reservation_creee", "paiement_recu")


def upgrade() -> None:
    op.drop_constraint("notifications_type_check", "notifications", type_="check")
    valeurs = ", ".join(f"'{v}'" for v in NOUVEAUX_TYPES)
    op.create_check_constraint(
        "notifications_type_check", "notifications", f"type IN ({valeurs})",
    )


def downgrade() -> None:
    op.drop_constraint("notifications_type_check", "notifications", type_="check")
    valeurs = ", ".join(f"'{v}'" for v in ANCIENS_TYPES)
    op.create_check_constraint(
        "notifications_type_check", "notifications", f"type IN ({valeurs})",
    )
