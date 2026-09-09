"""FIRMS service: live retrieval + normalization. Credentials never leave backend."""
from __future__ import annotations

import csv
import io
from datetime import datetime, timezone
from typing import Any

import httpx

from app.core.config import get_settings
from app.core.logging import get_logger

log = get_logger("firms")

# Documented mapping for VIIRS categorical confidence (l/n/h).
# These are NOT percentages; we map to an ordinal numeric proxy and keep raw.
VIIRS_CONFIDENCE_MAP = {"l": 30.0, "n": 60.0, "h": 90.0}
MODIS_CONFIDENCE_MAP = {"l": 30.0, "n": 60.0, "h": 90.0}


def normalize_confidence(value: Any) -> dict:
    """Return {raw, level, numeric}. Numeric is a proxy, never claimed as %."""
    raw = value
    if value is None or (isinstance(value, str) and not value.strip()):
        return {"confidence_raw": None, "confidence_level": "unknown", "confidence_numeric": None}
    if isinstance(value, (int, float)):
        v = float(value)
        if 0 <= v <= 100:
            level = "low" if v < 40 else ("nominal" if v < 75 else "high")
            return {"confidence_raw": raw, "confidence_level": level, "confidence_numeric": v}
        return {"confidence_raw": raw, "confidence_level": "unknown", "confidence_numeric": None}
    s = str(value).strip().lower()
    if s in VIIRS_CONFIDENCE_MAP:
        level = {"l": "low", "n": "nominal", "h": "high"}[s]
        return {"confidence_raw": raw, "confidence_level": level, "confidence_numeric": VIIRS_CONFIDENCE_MAP[s]}
    # numeric strings
    try:
        v = float(s)
        if 0 <= v <= 100:
            level = "low" if v < 40 else ("nominal" if v < 75 else "high")
            return {"confidence_raw": raw, "confidence_level": level, "confidence_numeric": v}
    except ValueError:
        pass
    return {"confidence_raw": raw, "confidence_level": "unknown", "confidence_numeric": None}


def normalize_observation(raw: dict[str, Any], default_source: str = "VIIRS") -> dict[str, Any]:
    """Normalize heterogeneous FIRMS records into internal schema."""
    lat = raw.get("latitude", raw.get("lat", raw.get("Latitude")))
    lon = raw.get("longitude", raw.get("lon", raw.get("Longitude", raw.get("longitude"))))
    acq_date = raw.get("acq_date", raw.get("ACQ_DATE"))
    acq_time = raw.get("acq_time", raw.get("ACQ_TIME"))
    acquired_at = raw.get("acquired_at")
    if acquired_at is None and acq_date:
        try:
            t = str(acq_time if acq_time is not None else "0000").zfill(4)
            acquired_at = datetime.strptime(f"{acq_date} {t}", "%Y-%m-%d %H%M").replace(tzinfo=timezone.utc)
        except Exception:
            acquired_at = None
    if isinstance(acquired_at, str):
        try:
            acquired_at = datetime.fromisoformat(acquired_at.replace("Z", "+00:00"))
        except Exception:
            acquired_at = None
    if acquired_at is None:
        acquired_at = datetime.now(timezone.utc)
    conf = normalize_confidence(raw.get("confidence", raw.get("Confidence", raw.get("conf"))))
    dn = raw.get("daynight", raw.get("DayNight", raw.get("day_night", "D")))
    dn = str(dn).upper()[0] if dn else "D"
    if dn not in ("D", "N"):
        dn = "D"
    # Sanitize raw_payload: convert datetime -> isoformat strings
    clean_raw = {}
    for k, v in raw.items():
        if isinstance(v, datetime):
            clean_raw[k] = v.isoformat()
        else:
            clean_raw[k] = v
    return {
        "latitude": float(lat),
        "longitude": float(lon),
        "acquired_at": acquired_at,
        "brightness_k": _f(raw.get("brightness_k", raw.get("brightness", raw.get("BRIGHTNESS", raw.get("bright_ti4"))))),
        "frp_mw": _f(raw.get("frp_mw", raw.get("frp", raw.get("FRP")))),
        "confidence": str(raw.get("confidence", raw.get("Confidence", ""))),
        "confidence_raw": conf["confidence_raw"],
        "confidence_level": conf["confidence_level"],
        "confidence_numeric": conf["confidence_numeric"],
        "daynight": dn,
        "satellite": str(raw.get("satellite", raw.get("SATELLITE", "VIIRS"))),
        "instrument": str(raw.get("instrument", raw.get("INSTRUMENT", default_source))),
        "scan_km": _f(raw.get("scan_km", raw.get("SCAN"))),
        "track_km": _f(raw.get("track_km", raw.get("TRACK"))),
        "source": str(raw.get("source", default_source)),
        "raw_payload": clean_raw,
    }


def _f(v: Any) -> float | None:
    try:
        return float(v) if v is not None and str(v).strip() != "" else None
    except (TypeError, ValueError):
        return None


class FirmsService:
    """Thin client over NASA FIRMS API (v3 area endpoint)."""

    def __init__(self) -> None:
        self.settings = get_settings()

    @property
    def enabled(self) -> bool:
        return bool(self.settings.FIRMS_MAP_KEY) and self.settings.ENABLE_LIVE_FIRMS

    def _client(self) -> httpx.Client:
        return httpx.Client(timeout=self.settings.FIRMS_TIMEOUT_S)

    def _url(self, source: str, bbox: str, day_range: int) -> str:
        base = self.settings.FIRMS_API_BASE_URL.rstrip("/")
        return f"{base}/area/csv/{self.settings.FIRMS_MAP_KEY}/{source}/world/{day_range}/{bbox}"

    def _fetch_csv(self, source: str, bbox: str, day_range: int) -> list[dict[str, Any]]:
        if not self.enabled:
            raise RuntimeError("FIRMS live mode is disabled (no MAP key or ENABLE_LIVE_FIRMS=false)")
        url = self._url(source, bbox, day_range)
        log.info("FIRMS fetch source=%s bbox=%s days=%s", source, bbox, day_range)
        with self._client() as c:
            r = c.get(url)
            r.raise_for_status()
            reader = csv.DictReader(io.StringIO(r.text))
            return [normalize_observation(dict(row), default_source=source) for row in reader]

    def get_recent_events(self, source: str = "VIIRS_SNPP_NRT", day_range: int = 1) -> list[dict[str, Any]]:
        return self._fetch_csv(source, "-180,-90,180,90", day_range)

    def get_events_by_area(self, min_lon: float, min_lat: float, max_lon: float, max_lat: float,
                           source: str = "VIIRS_SNPP_NRT", day_range: int = 2) -> list[dict[str, Any]]:
        return self._fetch_csv(source, f"{min_lon},{min_lat},{max_lon},{max_lat}", day_range)

    def get_events_by_date(self, day_range: int = 7, source: str = "VIIRS_SNPP_NRT") -> list[dict[str, Any]]:
        return self._fetch_csv(source, "-180,-90,180,90", day_range)

    def get_event_history(self, lat: float, lon: float, radius_km: float = 2.0,
                          source: str = "VIIRS_SNPP_NRT", day_range: int = 7) -> list[dict[str, Any]]:
        # FIRMS area API has no radius endpoint; fetch India bbox and filter locally.
        obs = self._fetch_csv(source, "68,6,98,38", day_range)
        from app.services.geo_service import haversine_km
        return [o for o in obs if haversine_km(lat, lon, o["latitude"], o["longitude"]) <= radius_km]
