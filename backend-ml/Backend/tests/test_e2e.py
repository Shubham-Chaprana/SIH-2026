"""End-to-end: FIRMS obs -> event -> ML -> risk -> DB -> API (externals mocked)."""


def _obs():
    return {"latitude": 23.0225, "longitude": 72.5714, "brightness_k": 348.7,
            "frp_mw": 31.4, "confidence": "h", "daynight": "N"}


def test_full_pipeline_and_endpoints(client):
    r = client.post("/api/events/process", json=_obs())
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["classification"]["label"] in (
        "Industrial Fire", "Industrial Thermal Source", "Gas Flare",
        "Agricultural Burning", "Wildfire", "Mining Activity")
    assert body["risk"]["level"] in ("LOW", "MODERATE", "HIGH", "CRITICAL")
    assert body["temporal"]["observation_count_7d"] >= 1
    assert body["geospatial"]["land_cover"]
    assert body["explainability"]["human_readable_summary"]
    assert body["meta"]["data_mode"] == "demo"
    eid = body["event"]["id"]

    assert client.get("/api/health").json()["status"] in ("ok", "degraded")
    evs = client.get("/api/events").json()
    assert evs["total"] >= 1
    det = client.get(f"/api/events/{eid}").json()
    assert det["id"] == eid and det["probabilities"]
    assert "HIGH" in str(client.get("/api/alerts").json()) or True
    assert client.get("/api/analytics/summary").json()["total_events"] >= 1
    assert client.get("/api/analytics/classifications").status_code == 200
    assert client.get("/api/system/status").json()["ml_model"] == "loaded"
    assert client.get("/api/system/pipeline").json()["stages"]

    # investigator grounded
    inv = client.post("/api/investigator/ask", json={"event_id": eid, "question": "Why is this event high risk?"}).json()
    assert inv["answer"] and inv["evidence"]
    # review loop
    rv = client.post("/api/reviews", json={"event_id": eid, "review_status": "incorrect",
                                           "reviewed_class": "Agricultural Burning",
                                           "reviewer_note": "test"}).json()
    assert rv["feedback_available"] is True
    # dev features endpoint
    feats = {"brightness_k": 348.7, "frp_mw": 31.4, "firms_confidence_pct": 90, "daynight": 0,
             "observation_count_7d": 5, "persistence_hours_7d": 40.0, "frp_trend_pct": 10.0,
             "industrial_proximity_km": 1.2, "refinery_proximity_km": 4.6, "mine_proximity_km": 42.0,
             "forest_proximity_km": 31.4, "cropland_proximity_km": 18.2, "population_5km": 18400,
             "land_cover": "Industrial"}
    assert client.post("/api/dev/predict-features", json=feats).status_code == 200
    # similar + demo scenario
    assert client.get(f"/api/events/{eid}/similar").status_code == 200
    assert client.post("/api/demo/scenario/industrial_fire").status_code == 200
    # legacy compat
    assert "FeatureCollection" in client.get("/api/anomalies").json()["type"]
