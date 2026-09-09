"""Temporal feature engine: observation_count_7d, persistence_hours_7d, frp_trend_pct."""
from __future__ import annotations

from datetime import datetime, timedelta, timezone
from statistics import median


def _aware(dt: datetime) -> datetime:
    return dt if dt.tzinfo is not None else dt.replace(tzinfo=timezone.utc)


def compute_temporal_features(observations: list[dict], now: datetime | None = None,
                              window_h: float = 168.0) -> dict:
    """observations: list of {acquired_at, frp_mw}. Robust to missing/single values."""
    now = _aware(now or datetime.now().astimezone())
    cutoff = now - timedelta(hours=window_h)
    in_win = [o for o in observations if o.get("acquired_at") and _aware(o["acquired_at"]) >= cutoff]
    count = len(in_win)
    if count == 0:
        return {"observation_count_7d": 0, "persistence_hours_7d": 0.0,
                "frp_trend_pct": None, "frp_trend_reason": "no_observations_in_window"}
    times = sorted(_aware(o["acquired_at"]) for o in in_win)
    persistence = (times[-1] - times[0]).total_seconds() / 3600.0 if len(times) > 1 else 0.0
    frps = [float(o["frp_mw"]) for o in in_win if o.get("frp_mw") not in (None, "")]
    trend, reason = None, None
    if len(frps) < 4:
        reason = "insufficient_observations_for_trend"
    else:
        ordered = sorted(in_win, key=lambda o: _aware(o["acquired_at"]))
        half = len(ordered) // 2
        early = [float(o["frp_mw"]) for o in ordered[:half] if o.get("frp_mw") not in (None, "")]
        late = [float(o["frp_mw"]) for o in ordered[half:] if o.get("frp_mw") not in (None, "")]
        if not early or not late:
            reason = "missing_frp_values"
        else:
            e, l = median(early), median(late)
            if e == 0:
                reason = "zero_baseline_frp"
            else:
                trend = round((l - e) / abs(e) * 100.0, 2)
    out = {"observation_count_7d": count, "persistence_hours_7d": round(persistence, 2),
           "frp_trend_pct": trend}
    if reason:
        out["frp_trend_reason"] = reason
    return out
