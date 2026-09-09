"""Explainability from real model evidence (SHAP when available, else gain-based fallback)."""
from __future__ import annotations

from typing import Any

import numpy as np

from app.ml import model_loader
from app.ml.feature_schema import FEATURE_NAMES

_REASONS = {
    "industrial_proximity_km": "Event is close to mapped industrial infrastructure.",
    "refinery_proximity_km": "Event is close to a mapped refinery/petroleum facility.",
    "mine_proximity_km": "Event is close to mapped mining activity.",
    "forest_proximity_km": "Event is far from forest, reducing wildfire likelihood." ,
    "cropland_proximity_km": "Event is close to cropland, consistent with agricultural burning.",
    "population_5km": "Significant population lives within 5 km (exposure context).",
    "observation_count_7d": "Repeated satellite detections indicate a persistent source.",
    "persistence_hours_7d": "Long persistence suggests an ongoing thermal source, not a transient hotspot.",
    "frp_trend_pct": "Fire radiative power is trending upward, indicating intensification.",
    "brightness_k": "High brightness temperature indicates intense thermal emission.",
    "frp_mw": "Elevated fire radiative power indicates significant heat output.",
    "firms_confidence_pct": "FIRMS reported high detection confidence.",
    "land_cover": "Local land cover matches this class context.",
    "daynight": "Day/night detection timing is consistent with this class.",
}

_CLASS_HINTS = {
    "Industrial Fire": ["industrial_proximity_km", "persistence_hours_7d", "observation_count_7d", "population_5km"],
    "Industrial Thermal Source": ["industrial_proximity_km", "persistence_hours_7d", "frp_trend_pct"],
    "Gas Flare": ["refinery_proximity_km", "persistence_hours_7d", "frp_trend_pct"],
    "Agricultural Burning": ["cropland_proximity_km", "observation_count_7d"],
    "Wildfire": ["forest_proximity_km", "frp_mw", "brightness_k"],
    "Mining Activity": ["mine_proximity_km", "persistence_hours_7d"],
}

_shap_explainer = None


def _shap_values(X: np.ndarray, predicted_idx: int) -> np.ndarray | None:
    global _shap_explainer
    try:
        import shap  # type: ignore
    except Exception:
        return None
    try:
        model, _, _ = model_loader.get_artifacts()
        if _shap_explainer is None:
            _shap_explainer = shap.TreeExplainer(model)
        sv = _shap_explainer.shap_values(X)
        arr = np.asarray(sv)
        if arr.ndim == 3:  # (n, features, classes)
            return arr[0, :, predicted_idx]
        if arr.ndim == 2:
            return arr[0]
        return None
    except Exception:
        return None


def explain_prediction(features: dict, predicted_class: str, probabilities: dict) -> dict[str, Any]:
    from app.ml.predictor import encode_features
    model, encoders, metadata = model_loader.get_artifacts()
    classes = list(encoders["label_encoder"].classes_)
    pred_idx = classes.index(predicted_class) if predicted_class in classes else int(np.argmax(list(probabilities.values())))
    X = np.array([encode_features(features)], dtype=float)
    shap_vals = _shap_values(X, pred_idx)
    if shap_vals is not None:
        contribs = {name: float(v) for name, v in zip(FEATURE_NAMES, shap_vals)}
        method = "shap-tree"
    else:
        # Deterministic fallback: global gain importance weighted toward class-hint features.
        imp = {r["feature"]: float(r["importance"]) for r in (metadata.get("feature_importance") or [])}
        hints = _CLASS_HINTS.get(predicted_class, [])
        contribs = {n: float(imp.get(n, 0.01)) * (1.6 if n in hints else 1.0) for n in FEATURE_NAMES}
        # sign by proximity logic: closeness (small km) supports infra classes
        for n in ("industrial_proximity_km", "refinery_proximity_km", "mine_proximity_km"):
            try:
                if float(features.get(n, 50)) > 25:
                    contribs[n] = -contribs[n]
            except (TypeError, ValueError):
                pass
        method = "gain-weighted-fallback"
    ranked = sorted(contribs.items(), key=lambda kv: kv[1], reverse=True)
    pos = [{"feature": k, "value": features.get(k), "contribution": round(v, 4),
            "direction": "positive", "reason": _REASONS.get(k, "")} for k, v in ranked if v >= 0][:5]
    neg = [{"feature": k, "value": features.get(k), "contribution": round(v, 4),
            "direction": "negative", "reason": _REASONS.get(k, "")} for k, v in reversed(ranked) if v < 0][:3]
    top_names = [p["feature"].replace("_km", "").replace("_", " ") for p in pos[:2]]
    summary = (f"{' and '.join(top_names)} were the strongest signals supporting the "
               f"{predicted_class} prediction." if top_names else
               f"Model evidence supports {predicted_class}.")
    return {"method": method, "top_positive_features": pos, "top_negative_features": neg,
            "feature_contributions": {k: round(v, 4) for k, v in contribs.items()},
            "human_readable_summary": summary}
