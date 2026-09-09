from __future__ import annotations

from pydantic import BaseModel


class HealthOut(BaseModel):
    status: str
    version: str
    model_loaded: bool
    database_connected: bool
    firms_enabled: bool
    ai_enabled: bool
    data_mode_default: str = "demo"


class SystemStatusOut(BaseModel):
    database: str
    firms: str
    osm: str
    land_cover: str
    population: str
    ml_model: str
    ai: str
    scheduler: str
    latencies_ms: dict[str, float] | None = None
