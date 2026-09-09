"""FIRMS ingestion worker: periodic poll with retry/timeout/dedup/graceful failure."""
from __future__ import annotations

from app.core.logging import get_logger
from app.db.database import SessionLocal
from app.services import event_service
from app.services.firms_service import FirmsService

log = get_logger("worker")

_seen: set[tuple] = set()


def poll_once(data_mode: str = "live", max_obs: int = 200) -> int:
    svc = FirmsService()
    if not svc.enabled:
        log.info("FIRMS poll skipped (live disabled)")
        return 0
    try:
        obs = svc.get_recent_events()
    except Exception as e:  # noqa: BLE001
        log.warning("FIRMS poll failed gracefully: %s", e)
        return 0
    n = 0
    with SessionLocal() as db:
        for o in obs[:max_obs]:
            key = (round(o["latitude"], 3), round(o["longitude"], 3), str(o["acquired_at"]))
            if key in _seen:
                continue
            _seen.add(key)
            try:
                event_service.process_event(o, db, data_mode=data_mode)
                n += 1
            except Exception as e:  # noqa: BLE001
                log.warning("event processing failed: %s", e)
    log.info("FIRMS poll ingested %s events", n)
    return n
