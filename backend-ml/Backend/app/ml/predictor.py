"""Predictor: feature encoding + inference + uncertainty flags."""
from __future__ import annotations

import time
from typing import Any

import numpy as np

from app.core.config import get_settings
from app.ml import model_loader
from app.ml.feature_schema import FEATURE_NAMES, validate_feature_dict

_latency_ms: float = 0.0


def last_inference_latency_ms() -> float:
    return _latency_ms


def encode_features(features: dict) -> list[float]:
    _, encoders, _ = model_loader.get_artifacts()
    le_day = encoders["daynight_encoder"]
    le_lc = encoders["land_cover_encoder"]
    dn = features["daynight"]
    if isinstance(dn, str):
        dn = 1 if dn.upper().startswith("D") else 0
    dn_enc = int(le_day.transform([int(dn)])[0])
    lc_enc = int(le_lc.transform([str(features["land_cover"])])[0])
    row = []
    for name in FEATURE_NAMES:
        if name == "daynight":
            row.append(float(dn_enc))
        elif name == "land_cover":
            row.append(float(lc_enc))
        else:
            v = features[name]
            row.append(float(v if v is not None else 0.0))
    return row


def predict_features(features: dict) -> dict[str, Any]:
    global _latency_ms
    t0 = time.perf_counter()
    quality = validate_feature_dict(features)
    if quality["missing_features"] or quality["errors"]:
        raise ValueError(f"Invalid features: missing={quality['missing_features']} errors={quality['errors']}")
    model, encoders, metadata = model_loader.get_artifacts()
    settings = get_settings()
    X = np.array([encode_features(features)], dtype=float)
    proba = np.asarray(model.predict_proba(X)[0], dtype=float)
    classes = list(encoders["label_encoder"].inverse_transform(list(range(len(proba)))))
    order = np.argsort(proba)[::-1]
    top, second = proba[order[0]], (proba[order[1]] if len(proba) > 1 else 0.0)
    margin = float(top - second)
    low_margin = margin < settings.LOW_MARGIN_THRESHOLD
    _latency_ms = (time.perf_counter() - t0) * 1000.0
    return {
        "predicted_class": str(classes[int(order[0])]),
        "confidence": float(top),
        "probabilities": {str(c): float(p) for c, p in zip(classes, proba)},
        "model_version": settings.MODEL_VERSION,
        "feature_values": {k: features[k] for k in FEATURE_NAMES},
        "feature_quality": quality,
        "low_margin": low_margin,
        "needs_review": bool(low_margin),
        "margin": margin,
    }
