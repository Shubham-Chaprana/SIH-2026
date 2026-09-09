"""Structured logging without leaking secrets."""
from __future__ import annotations

import logging
import sys

_configured = False


def get_logger(name: str) -> logging.Logger:
    return logging.getLogger(f"thermos.{name}")


def setup_logging(level: str = "INFO") -> None:
    global _configured
    if _configured:
        return
    lvl = getattr(logging, level.upper(), logging.INFO)
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(logging.Formatter("%(asctime)s | %(levelname)s | %(name)s | %(message)s"))
    root = logging.getLogger("thermos")
    root.setLevel(lvl)
    root.handlers = [handler]
    # quiet noisy libs
    for noisy in ("httpx", "httpcore", "urllib3"):
        logging.getLogger(noisy).setLevel(logging.WARNING)
    _configured = True
