"""gamme/forfait/cgu par reservation, retrait des prix par bureau et des CGU par compte

La gamme (standard/vip) n'est plus une propriété du bureau : c'est un choix
du client à chaque réservation, avec un prix fixe par forfait (gamme x durée)
défini dans app/api/v1/modules/reservations/forfaits.py. Les CGU sont
acceptées à chaque réservation (preuve horodatée), plus au niveau du compte.

Revision ID: c3d4e5f6a7b8
Revises: b2c3d4e5f6a7
Create Date: 2026-07-09

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "c3d4e5f6a7b8"
down_revision: Union[str, None] = "b2c3d4e5f6a7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # reservations : gamme/forfait choisis par le client, CGU horodatées par réservation
    op.add_column(
        "reservations",
        sa.Column("gamme", sa.String(20), nullable=False, server_default="standard"),
    )
    op.add_column(
        "reservations",
        sa.Column("forfait", sa.String(20), nullable=False, server_default="jour"),
    )
    op.add_column(
        "reservations",
        sa.Column("cgu_acceptees", sa.Boolean(), nullable=False, server_default=sa.false()),
    )
    op.add_column(
        "reservations",
        sa.Column("date_acceptation_cgu", sa.DateTime(timezone=True), nullable=True),
    )
    op.alter_column("reservations", "gamme", server_default=None)
    op.alter_column("reservations", "forfait", server_default=None)
    op.alter_column("reservations", "cgu_acceptees", server_default=None)

    # espaces : le bureau n'a plus de prix propre, ni de gamme figée
    op.drop_column("espaces", "est_vip")
    op.drop_column("espaces", "prix_mois")
    op.drop_column("espaces", "prix_semaine")
    op.drop_column("espaces", "prix_jour")
    op.drop_column("espaces", "prix_heure")

    # utilisateurs : les CGU ne sont plus une propriété du compte
    op.drop_column("utilisateurs", "conditions_acceptees_date")
    op.drop_column("utilisateurs", "conditions_acceptees")


def downgrade() -> None:
    op.add_column("utilisateurs", sa.Column("conditions_acceptees", sa.Boolean(), nullable=False, server_default=sa.false()))
    op.add_column("utilisateurs", sa.Column("conditions_acceptees_date", sa.DateTime(timezone=True), nullable=True))
    op.alter_column("utilisateurs", "conditions_acceptees", server_default=None)

    op.add_column("espaces", sa.Column("prix_heure", sa.Numeric(15, 2), nullable=True))
    op.add_column("espaces", sa.Column("prix_jour", sa.Numeric(15, 2), nullable=True))
    op.add_column("espaces", sa.Column("prix_semaine", sa.Numeric(15, 2), nullable=True))
    op.add_column("espaces", sa.Column("prix_mois", sa.Numeric(15, 2), nullable=True))
    op.add_column("espaces", sa.Column("est_vip", sa.Boolean(), nullable=False, server_default=sa.false()))
    op.alter_column("espaces", "est_vip", server_default=None)

    op.drop_column("reservations", "date_acceptation_cgu")
    op.drop_column("reservations", "cgu_acceptees")
    op.drop_column("reservations", "forfait")
    op.drop_column("reservations", "gamme")
