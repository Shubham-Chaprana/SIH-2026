"""Single/batch inference with the saved THERMOS classifier."""
import json, sys
from pathlib import Path
import joblib, pickle
import numpy as np
REPO = Path(__file__).resolve().parents[0]
model = joblib.load(REPO / "ml" / "models" / "xgboost_classifier.pkl")
enc = pickle.load(open(REPO / "ml" / "models" / "label_encoders.pkl", "rb"))
meta = json.load(open(REPO / "ml" / "models" / "model_metadata.json"))
FEATS = meta["features"]
def predict(d: dict):
    dn = 1 if str(d["daynight"]).upper().startswith("D") else 0
    row = [d["brightness_k"], d["frp_mw"], d["firms_confidence_pct"],
           int(enc["daynight_encoder"].transform([int(dn)])[0]),
           d["observation_count_7d"], d["persistence_hours_7d"], d.get("frp_trend_pct", 0) or 0,
           d["industrial_proximity_km"], d["refinery_proximity_km"], d["mine_proximity_km"],
           d["forest_proximity_km"], d["cropland_proximity_km"], d["population_5km"],
           int(enc["land_cover_encoder"].transform([d["land_cover"]])[0])]
    proba = model.predict_proba(np.array([row]))[0]
    i = int(np.argmax(proba))
    return {"predicted_class": enc["label_encoder"].inverse_transform([i])[0],
            "confidence": float(proba[i]),
            "probabilities": {enc["label_encoder"].inverse_transform([j])[0]: float(v) for j, v in enumerate(proba)}}
if __name__ == "__main__":
    print(json.dumps(predict(json.loads(sys.argv[1])), indent=2))
