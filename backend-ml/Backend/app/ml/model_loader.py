"""Model loading: once at startup, joblib pickle + label encoders."""
from __future__ import annotations

import json
import pickle
from pathlib import Path
from typing import Any

from app.core.config import get_settings
from app.core.logging import get_logger

log = get_logger("ml")

_model: Any = None
_encoders: dict | None = None
_metadata: dict | None = None


def _resolve(path_str: str) -> Path:
    p = Path(path_str)
    if p.is_absolute() and p.exists():
        return p
    here = Path(__file__).resolve()
    # backend/app/ml/model_loader.py -> backend/
    backend_root = here.parents[2]
    repo_root = backend_root.parent
    for cand in (backend_root / path_str, repo_root / path_str.lstrip("./"),
                 repo_root / "ml" / "models" / Path(path_str).name, Path.cwd() / path_str):
        if cand.exists():
            return cand
    return p


def load_artifacts() -> tuple[Any, dict, dict]:
    global _model, _encoders, _metadata
    if _model is not None:
        return _model, _encoders or {}, _metadata or {}
    s = get_settings()
    mp, ep, mtp = _resolve(s.MODEL_PATH), _resolve(s.ENCODERS_PATH), _resolve(s.MODEL_METADATA_PATH)
    # fallback names: xgboost_classifier.pkl (canonical here)
    if not mp.exists():
        for alt in ("xgboost_classifier.pkl", "thermos_classifier.joblib"):
            cand = mp.parent / alt
            if cand.exists():
                mp = cand
                break
    log.info("Loading model from %s", mp)
    with open(mp, "rb") as f:
        _model = pickle.load(f)
    with open(ep, "rb") as f:
        _encoders = pickle.load(f)
    with open(mtp) as f:
        _metadata = json.load(f)
    log.info("Model loaded: %s classes=%s", mtp, (_metadata or {}).get("classes"))
    return _model, _encoders or {}, _metadata or {}


def get_artifacts():
    return load_artifacts()


def is_loaded() -> bool:
    return _model is not None
