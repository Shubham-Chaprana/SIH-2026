"""Trigger a live FIRMS poll once (requires FIRMS_MAP_KEY + ENABLE_LIVE_FIRMS=true)."""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from app.workers.firms_ingestion import poll_once
print("ingested:", poll_once(data_mode="live"))
