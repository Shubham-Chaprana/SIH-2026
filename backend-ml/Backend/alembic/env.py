from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from app.db.database import Base
import app.db.models  # noqa: F401
from app.core.config import get_settings

config = context.config
if config.get_main_option("sqlalchemy.url", "").startswith("postgresql") is False:
    pass
try:
    config.set_main_option("sqlalchemy.url", get_settings().DATABASE_URL)
except Exception:
    pass
if context.is_offline_mode():
    context.configure(url=config.get_main_option("sqlalchemy.url"), target_metadata=Base.metadata, literal_binds=True)
    with context.begin_transaction():
        context.run_migrations()
else:
    connectable = engine_from_config(config.get_section(config.config_ini_section, {}), prefix="sqlalchemy.", poolclass=pool.NullPool)
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=Base.metadata)
        with context.begin_transaction():
            context.run_migrations()
