"""Train THERMOS classifier: compares XGBoost vs baselines, selects on macro F1.
SYNTHETIC-DATA DISCLAIMER: metrics describe the development dataset only,
NOT real-world NASA FIRMS accuracy.
"""
import json, sys
from datetime import datetime, timezone
from pathlib import Path
import joblib, pandas as pd
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import (accuracy_score, balanced_accuracy_score, f1_score,
    precision_score, recall_score, classification_report, confusion_matrix)
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
import xgboost as xgb

REPO = Path(__file__).resolve().parents[1]
DATA = REPO / "THERMOS_ML_Core_15_Columns.csv"
if not DATA.exists():
    DATA = REPO / "ml" / "data" / "processed" / "thermos_clean.csv"
MODELS = REPO / "ml" / "models"; MODELS.mkdir(parents=True, exist_ok=True)
REPORTS = REPO / "ml" / "reports"; REPORTS.mkdir(parents=True, exist_ok=True)

def main():
    df = pd.read_csv(DATA)
    feats = [c for c in df.columns if c != "label"]
    X, y = df[feats].copy(), df["label"].copy()
    le_y = LabelEncoder(); y_e = le_y.fit_transform(y)
    le_lc = LabelEncoder(); X["land_cover"] = le_lc.fit_transform(X["land_cover"])
    le_dn = LabelEncoder(); X["daynight"] = le_dn.fit_transform(X["daynight"])
    Xtr, Xte, ytr, yte = train_test_split(X, y_e, test_size=0.2, random_state=42, stratify=y_e)
    cands = {
        "xgboost": xgb.XGBClassifier(n_estimators=200, max_depth=6, learning_rate=0.1,
            subsample=0.8, colsample_bytree=0.8, random_state=42, n_jobs=-1, eval_metric="mlogloss"),
        "random_forest": RandomForestClassifier(n_estimators=200, random_state=42, n_jobs=-1),
        "logistic": LogisticRegression(max_iter=2000),
    }
    rows = []
    for name, clf in cands.items():
        t0 = datetime.now()
        clf.fit(Xtr, ytr); p = clf.predict(Xte)
        rows.append({"model": name, "macro_f1": f1_score(yte, p, average="macro"),
            "accuracy": accuracy_score(yte, p), "balanced_acc": balanced_accuracy_score(yte, p),
            "infer_s": (datetime.now()-t0).total_seconds()})
    print(pd.DataFrame(rows).to_string())
    best = max(rows, key=lambda r: r["macro_f1"])["model"]
    print("selected:", best, "(macro F1)")
    model = cands[best]; model.fit(Xtr, ytr)
    p = model.predict(Xte)
    metrics = {"accuracy": accuracy_score(yte, p), "macro_f1": f1_score(yte, p, average="macro"),
        "macro_precision": precision_score(yte, p, average="macro"), "macro_recall": recall_score(yte, p, average="macro"),
        "weighted_f1": f1_score(yte, p, average="weighted"), "balanced_accuracy": balanced_accuracy_score(yte, p),
        "per_class": classification_report(yte, p, target_names=list(le_y.classes_), output_dict=True),
        "confusion_matrix": confusion_matrix(yte, p).tolist()}
    joblib.dump(model, MODELS / "thermos_classifier.joblib")
    import pickle
    pickle.dump(model, open(MODELS / "xgboost_classifier.pkl", "wb"))
    pickle.dump({"label_encoder": le_y, "land_cover_encoder": le_lc, "daynight_encoder": le_dn},
                open(MODELS / "label_encoders.pkl", "wb"))
    meta = {"model_version": "thermos-xgb-v1", "training_date": datetime.now(timezone.utc).isoformat(),
        "feature_names": feats, "classes": list(le_y.classes_), "metrics": metrics, "selected_model": best,
        "comparison": rows, "dataset": {"path": str(DATA), "rows": len(df),
        "note": "DEVELOPMENT/SYNTHETIC dataset — NOT real FIRMS ground truth; do not claim real-world accuracy."},
        "random_seed": 42, "feature_schema_version": "v1"}
    json.dump(meta, open(MODELS / "model_metadata.json", "w"), indent=2)
    # ablation
    abl = {}
    for name, cols in {"thermal_only": feats[:4], "thermal_temporal": feats[:7], "full": feats}.items():
        clf = xgb.XGBClassifier(n_estimators=100, max_depth=6, learning_rate=0.1, random_state=42,
                                n_jobs=-1, eval_metric="mlogloss")
        sc = cross_val_score(clf, X[cols], y_e, cv=3, scoring="f1_macro")
        abl[name] = {"macro_f1_mean": float(sc.mean()), "features": cols}
    json.dump({"ablation": abl, "disclaimer": "synthetic development data"}, open(REPORTS / "ablation.json", "w"), indent=2)
    print("ablation:", abl); print("saved.")
if __name__ == "__main__":
    main()
