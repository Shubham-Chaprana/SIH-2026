"""Geodesic helpers + event association. Replaceable with DBSCAN/HDBSCAN later."""
from __future__ import annotations

import math
from datetime import datetime, timezone


def _aware(dt: datetime) -> datetime:
    return dt if dt.tzinfo is not None else dt.replace(tzinfo=timezone.utc)

EARTH_R_KM = 6371.0088


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Geodesic distance in km. Never use degree-Euclidean."""
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlmb = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dlmb / 2) ** 2
    return 2 * EARTH_R_KM * math.asin(math.sqrt(a))


def hours_between(a: datetime, b: datetime) -> float:
    return abs((_aware(a) - _aware(b)).total_seconds()) / 3600.0


def find_candidate_event(lat: float, lon: float, acquired_at: datetime,
                         events: list, radius_km: float, window_h: float):
    """Return nearest event within radius AND time window, else None."""
    best, best_d = None, None
    for ev in events:
        d = haversine_km(lat, lon, ev.latitude, ev.longitude)
        if d > radius_km:
            continue
        ref = ev.last_detected_at or ev.first_detected_at
        if hours_between(acquired_at, ref) > window_h:
            continue
        if best is None or d < best_d:
            best, best_d = ev, d
    return best
