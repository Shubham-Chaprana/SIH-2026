"""Single source of truth for the 14-feature ML schema."""
from __future__ import annotations

FEATURE_NAMES: list[str] = [
    "brightness_k",
    "frp_mw",
    "firms_confidence_pct",
    "daynight",
    "observation_count_7d",
    "persistence_hours_7d",
    "frp_trend_pct",
    "industrial_proximity_km",
    "refinery_proximity_km",
    "mine_proximity_km",
    "forest_proximity_km",
    "cropland_proximity_km",
    "population_5km",
    "land_cover",
]

NUMERIC_FEATURES: list[str] = [f for f in FEATURE_NAMES if f not in ("daynight", "land_cover")]
CATEGORICAL_FEATURES: list[str] = ["daynight", "land_cover"]

MODEL_CLASSES: list[str] = [
    "Agricultural Burning",
    "Gas Flare",
    "Industrial Fire",
    "Industrial Thermal Source",
    "Mining Activity",
    "Wildfire",
]

LAND_COVER_CLASSES: list[str] = [
    "Bare Land",
    "Built-up",
    "Cropland",
    "Forest",
    "Grassland",
    "Industrial",
    "Mining",
    "Shrubland",
]

# Plausible ranges for validation (None = unbounded above)
FEATURE_RANGES: dict[str, tuple[float | None, float | None]] = {
    "brightness_k": (200.0, 500.0),
    "frp_mw": (0.0, 5000.0),
    "firms_confidence_pct": (0.0, 100.0),
    "observation_count_7d": (0.0, 100.0),
    "persistence_hours_7d": (0.0, 168.0),
    "frp_trend_pct": (-100.0, 500.0),
    "industrial_proximity_km": (0.0, None),
    "refinery_proximity_km": (0.0, None),
    "mine_proximity_km": (0.0, None),
    "forest_proximity_km": (0.0, None),
    "cropland_proximity_km": (0.0, None),
    "population_5km": (0.0, None),
}

FEATURE_SCHEMA_VERSION = "v1"


def validate_feature_dict(features: dict) -> dict:
    """Validate a feature dict. Returns {ok, missing, warnings, errors}."""
    import math

    missing = [f for f in FEATURE_NAMES if f not in features or features[f] is None]
    errors: list[str] = []
    warnings: list[str] = []
    for name in FEATURE_NAMES:
        if name in missing:
            continue
        v = features[name]
        if name == "daynight":
            if v not in (0, 1, "D", "N", "d", "n", "Day", "Night"):
                errors.append(f"daynight must be D/N or 0/1, got {v!r}")
        elif name == "land_cover":
            if not isinstance(v, str) or v not in LAND_COVER_CLASSES:
                errors.append(f"land_cover must be one of {LAND_COVER_CLASSES}, got {v!r}")
        else:
            try:
                fv = float(v)
            except (TypeError, ValueError):
                errors.append(f"{name} must be numeric, got {v!r}")
                continue
            if math.isnan(fv) or math.isinf(fv):
                errors.append(f"{name} must be finite, got {v!r}")
                continue
            lo, hi = FEATURE_RANGES.get(name, (None, None))
            if lo is not None and fv < lo:
                warnings.append(f"{name}={fv} below expected minimum {lo}")
            if hi is not None and fv > hi:
                warnings.append(f"{name}={fv} above expected maximum {hi}")
    unexpected = [k for k in features if k not in FEATURE_NAMES]
    if unexpected:
        warnings.append(f"Unexpected columns ignored: {unexpected}")
    return {
        "ok": not errors and not missing,
        "missing_features": missing,
        "errors": errors,
        "warnings": warnings,
    }
