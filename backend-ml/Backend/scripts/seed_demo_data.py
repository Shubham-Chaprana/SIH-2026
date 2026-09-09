"""Seed >=100 demo events across classes/regions. ALL marked data_mode='demo' (synthetic)."""
from __future__ import annotations

import random
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.core.logging import setup_logging
from app.db.database import Base, SessionLocal, engine
from app.services import event_service

setup_logging("INFO")
random.seed(42)

# (lat, lon, class_hint, landcover_hint)
REGIONS = [
    (23.0225, 72.5714, "Industrial Fire", "Industrial"),
    (22.72, 70.20, "Gas Flare", "Industrial"),
    (23.65, 86.45, "Mining Activity", "Mining"),
    (21.14, 79.38, "Wildfire", "Forest"),
    (30.33, 76.38, "Agricultural Burning", "Cropland"),
    (12.97, 77.59, "Agricultural Burning", "Cropland"),
    (19.07, 72.87, "Industrial Thermal Source", "Built-up"),
    (28.61, 77.20, "Industrial Thermal Source", "Built-up"),
    (21.93, 85.13, "Mining Activity", "Mining"),
    (26.85, 80.94, "Wildfire", "Grassland"),
]

NAMED = [
    ("IND-2048", 23.0225, 72.5714, 348.7, 31.4, "h", "N"),
    ("AGR-0882", 30.33, 76.38, 315.0, 8.2, "n", "D"),
    ("WLD-1452", 21.14, 79.38, 365.0, 55.0, "h", "D"),
    ("FLR-0291", 22.72, 70.20, 340.0, 22.0, "h", "N"),
]


def main(n: int = 120) -> None:
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        # named primaries first
        for eid, lat, lon, b, frp, conf, dn in NAMED:
            r = event_service.process_event({"latitude": lat, "longitude": lon, "brightness_k": b,
                                             "frp_mw": frp, "confidence": conf, "daynight": dn,
                                             "source": "VIIRS"}, db, data_mode="demo")
            print(f"seeded {eid} -> {r['event']['id']} {r['classification']}")
        for i in range(n - len(NAMED)):
            lat0, lon0, _, _ = REGIONS[i % len(REGIONS)]
            obs = {"latitude": lat0 + random.uniform(-0.4, 0.4),
                   "longitude": lon0 + random.uniform(-0.4, 0.4),
                   "brightness_k": round(random.uniform(300, 420), 1),
                   "frp_mw": round(random.uniform(3, 80), 1),
                   "confidence": random.choice(["l", "n", "h"]),
                   "daynight": random.choice(["D", "N"]),
                   "acquired_at": (datetime.now(timezone.utc) - timedelta(hours=random.randint(0, 150))).isoformat(),
                   "source": "VIIRS"}
            event_service.process_event(obs, db, data_mode="demo")
        print(f"Seeded {n} demo events (data_mode=demo, synthetic).")


if __name__ == "__main__":
    main(int(sys.argv[1]) if len(sys.argv) > 1 else 120)
