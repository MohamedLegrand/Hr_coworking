"""ajout des types document_valide / document_refuse sur notifications

Revision ID: d0e1f2a3b4c5
Revises: c9d0e1f2a3b4
Create Date: 2026-07-14

"""
from typing import Sequence, Union

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "d0e1f2a3b4c5"
down_revision: Union[str, None] = "c9d0e1f2a3b4"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

_ANCIENNES_VALEURS = (
    "'confirmation', 'rappel', 'annulation', 'reservation_creee', 'paiement_recu'"
)
_NOUVELLES_VALEURS = (
    "'confirmation', 'rappel', 'annulation', 'reservation_creee', 'paiement_recu', "
    "'document_valide', 'document_refuse'"
)


def upgrade() -> None:
    op.drop_constraint("notifications_type_check", "notifications", type_="check")
    op.create_check_constraint(
        "notifications_type_check",
        "notifications",
        f"type IN ({_NOUVELLES_VALEURS})",
    )


def downgrade() -> None:
    op.drop_constraint("notifications_type_check", "notifications", type_="check")
    op.create_check_constraint(
        "notifications_type_check",
        "notifications",
        f"type IN ({_ANCIENNES_VALEURS})",
    )
