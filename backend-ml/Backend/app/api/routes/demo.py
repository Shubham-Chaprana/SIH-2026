"""Demo scenarios + similar events. All demo data explicitly marked data_mode='demo'."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db import models as m
from app.db.database import get_db
from app.services import event_service
from app.services.investigator_service import find_similar

router = APIRouter(tags=["demo"])

SCENARIOS = {
    "industrial_fire": {"latitude": 23.0225, "longitude": 72.5714, "brightness_k": 348.7,
                        "frp_mw": 31.4, "confidence": "h", "daynight": "N",
                        "satellite": "VIIRS", "instrument": "VIIRS", "source": "VIIRS"},
    "agricultural_burn": {"latitude": 30.33, "longitude": 76.38, "brightness_k": 315.0,
                          "frp_mw": 8.2, "confidence": "n", "daynight": "D",
                          "satellite": "VIIRS", "instrument": "VIIRS", "source": "VIIRS"},
    "wildfire": {"latitude": 21.14, "longitude": 79.38, "brightness_k": 365.0,
                 "frp_mw": 55.0, "confidence": "h", "daynight": "D",
                 "satellite": "MODIS", "instrument": "MODIS", "source": "MODIS"},
    "gas_flare": {"latitude": 22.72, "longitude": 70.20, "brightness_k": 340.0,
                  "frp_mw": 22.0, "confidence": "h", "daynight": "N",
                  "satellite": "VIIRS", "instrument": "VIIRS", "source": "VIIRS"},
}


@router.post("/demo/scenario/{name}")
def run_scenario(name: str, db: Session = Depends(get_db)):
    if name not in SCENARIOS:
        raise HTTPException(404, f"Unknown scenario {name}. Choose from {list(SCENARIOS)}")
    result = event_service.process_event(dict(SCENARIOS[name]), db, data_mode="demo")
    result["meta"]["demo_note"] = "Synthetic demo observation, not a real FIRMS detection."
    return result


@router.get("/events/{event_id}/similar")
def similar_events(event_id: str, top_n: int = 5, db: Session = Depends(get_db)):
    target = event_service.get_event_context(event_id, db)
    if not target:
        raise HTTPException(404, f"Event {event_id} not found")
    rows = db.execute(select(m.ThermalEvent).limit(500)).scalars().all()
    others = []
    for e in rows:
        if e.id == event_id:
            continue
        others.append({"id": e.id, "feature_values": e.feature_values or {},
                       "classification": {"label": e.current_classification},
                       "temporal": e.temporal_context or {}, "geospatial": e.geospatial_context or {}})
    return {"items": find_similar(target, others, min(top_n, 20))}
