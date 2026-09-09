from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class PredictFeaturesIn(BaseModel):
    brightness_k: float
    frp_mw: float
    firms_confidence_pct: float
    daynight: int | str
    observation_count_7d: int | float
    persistence_hours_7d: float
    frp_trend_pct: float | None = None
    industrial_proximity_km: float
    refinery_proximity_km: float
    mine_proximity_km: float
    forest_proximity_km: float
    cropland_proximity_km: float
    population_5km: float | int
    land_cover: str


class PredictOut(BaseModel):
    predicted_class: str
    confidence: float
    probabilities: dict[str, float]
    model_version: str
    feature_values: dict[str, Any]
    feature_quality: dict[str, Any]
    low_margin: bool = False
    needs_review: bool = False
    explanations: dict[str, Any] | None = None


class ProcessOut(BaseModel):
    event: dict[str, Any]
    classification: dict[str, Any]
    risk: dict[str, Any]
    temporal: dict[str, Any]
    geospatial: dict[str, Any]
    explainability: dict[str, Any]
    data_quality: dict[str, Any]
    meta: dict[str, Any]
