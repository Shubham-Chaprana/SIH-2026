import os
import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

os.environ["DATABASE_URL"] = "sqlite:///./test_thermos.db"
os.environ["ENABLE_LIVE_FIRMS"] = "false"
os.environ["ENABLE_SCHEDULER"] = "false"
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

# Mock OSM network before app import
import app.services.osm_service as osm
osm.query_osm = lambda lat, lon, radius_km=None: {
    "source_status": "available", "elements": [], "counts": {},
    "nearest": {"industrial": {"lat": lat, "lon": lon, "dist_km": 1.2, "tags": {}},
                "refinery": {"lat": lat, "lon": lon, "dist_km": 4.6, "tags": {}},
                "mine": {"lat": lat, "lon": lon, "dist_km": 42.0, "tags": {}},
                "forest": {"lat": lat, "lon": lon, "dist_km": 31.4, "tags": {}},
                "farmland": {"lat": lat, "lon": lon, "dist_km": 18.2, "tags": {}},
                "settlement": None}}

from app.db.database import Base, get_db  # noqa: E402
from app.main import create_app  # noqa: E402

TEST_DB = "./test_thermos.db"
if os.path.exists(TEST_DB):
    os.remove(TEST_DB)
engine = create_engine("sqlite:///" + TEST_DB, connect_args={"check_same_thread": False})
TestingSession = sessionmaker(bind=engine, autoflush=False, autocommit=False, expire_on_commit=False)
Base.metadata.create_all(bind=engine)


def override_db():
    db = TestingSession()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture()
def client():
    app = create_app()
    app.dependency_overrides[get_db] = override_db
    with TestClient(app) as c:
        yield c
