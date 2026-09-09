"""Evaluate saved model. Metrics describe development data only — not real-world accuracy."""
import json
from pathlib import Path
import joblib, pandas as pd
from sklearn.metrics import classification_report, confusion_matrix, f1_score, accuracy_score, balanced_accuracy_score

REPO = Path(__file__).resolve().parents[0]
for cand in (REPO / "ml" / "models" / "thermos_classifier.joblib", REPO / "ml" / "models" / "xgboost_classifier.pkl"):
    if cand.exists():
        MP = cand; break
DATA = REPO / "THERMOS_ML_Core_15_Columns.csv"
model = joblib.load(MP)
enc = joblib.load(REPO / "ml" / "models" / "label_encoders.pkl") if (REPO/"ml"/"models"/"label_encoders.pkl").suffix==".pkl" else None
import pickle
enc = pickle.load(open(REPO / "ml" / "models" / "label_encoders.pkl", "rb"))
df = pd.read_csv(DATA).sample(min(2000, len(pd.read_csv(DATA))), random_state=0)
feats = [c for c in df.columns if c != "label"]
X = df[feats].copy()
X["land_cover"] = enc["land_cover_encoder"].transform(X["land_cover"])
X["daynight"] = enc["daynight_encoder"].transform(X["daynight"].astype(int))
y = enc["label_encoder"].transform(df["label"])
p = model.predict(X)
print("acc", accuracy_score(y, p), "macroF1", f1_score(y, p, average="macro"), "balAcc", balanced_accuracy_score(y, p))
print(classification_report(y, p, target_names=list(enc["label_encoder"].classes_)))
print(confusion_matrix(y, p))
