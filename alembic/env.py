from logging.config import fileConfig
from alembic import context
from app.noyau.configuration import settings
from app.noyau.base_donnees import Base

# Importer ici tous les modèles pour qu'Alembic les détecte (autogenerate) :
from app.api.v1.modules.authentification.modeles import Utilisateur  # noqa: F401
from app.api.v1.modules.espaces.modeles import Espace  # noqa: F401
from app.api.v1.modules.reservations.modeles import Reservation, ReservationDetail  # noqa: F401
from app.api.v1.modules.paiements.modeles import Paiement  # noqa: F401
from app.api.v1.modules.notifications.modeles import Notification  # noqa: F401

config = context.config
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline():
    url = config.get_main_option("sqlalchemy.url")
    context.configure(url=url, target_metadata=target_metadata, literal_binds=True)
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online():
    from sqlalchemy import engine_from_config, pool
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
