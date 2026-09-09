"""Initialize DB tables (dev). Prod uses Alembic migrations."""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from app.db.database import Base, engine
Base.metadata.create_all(bind=engine)
print("DB initialized.")
