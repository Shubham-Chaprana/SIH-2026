# Frontend Integration Contract

Base URL: `http://localhost:8000` (prod: set `VITE_THERMOS_API_URL`). CORS allows the dev origins in `CORS_ORIGINS`.

```js
const API = 'http://localhost:8000';
const j = (r) => { if (!r.ok) throw new Error(r.status); return r.json(); };
// map
const events = await fetch(`${API}/api/events?limit=200`).then(j);
// detail
const det = await fetch(`${API}/api/events/${id}`).then(j);
// process new FIRMS detection
const intel = await fetch(`${API}/api/events/process`, {method:'POST',
  headers:{'Content-Type':'application/json'},
  body: JSON.stringify({latitude:23.0225, longitude:72.5714, brightness_k:348.7, frp_mw:31.4, confidence:'h', daynight:'N'})}).then(j);
// alerts / analytics
const alerts = await fetch(`${API}/api/alerts?risk=HIGH`).then(j);
const summary = await fetch(`${API}/api/analytics/summary`).then(j);
// investigator
const inv = await fetch(`${API}/api/investigator/ask`, {method:'POST',
  headers:{'Content-Type':'application/json'},
  body: JSON.stringify({event_id:id, question:'Why is this event high risk?'})}).then(j);
// review
await fetch(`${API}/api/reviews`, {method:'POST', headers:{'Content-Type':'application/json'},
  body: JSON.stringify({event_id:id, review_status:'incorrect', reviewed_class:'Agricultural Burning'})}).then(j);
// system
const status = await fetch(`${API}/api/system/status`).then(j);
const health = await fetch(`${API}/api/health`).then(j);
```

Notes: `confidence` on map items is 0–100 (already scaled); detail `confidence` is 0–1.
`risk` is an operational priority score (not disaster probability). `data_mode` is `demo`|`live`.
Legacy `GET /api/anomalies` + `GET /api/stats` keep the current dashboard working.
