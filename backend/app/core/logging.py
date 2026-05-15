from __future__ import annotations

import logging
from datetime import datetime, timedelta
from logging import Handler, LogRecord, StreamHandler
from pathlib import Path

from app.core.config import Settings


LOG_FORMAT = "%(asctime)s %(levelname)s [%(name)s] [request_id=%(request_id)s] %(message)s"
DATE_FORMAT = "%Y-%m-%d %H:%M:%S"


class RequestIdFilter(logging.Filter):
    def filter(self, record: LogRecord) -> bool:
        if not hasattr(record, "request_id"):
            record.request_id = "-"
        return True


class DailyFileHandler(Handler):
    def __init__(self, log_dir: Path, filename_prefix: str = "styleforge") -> None:
        super().__init__()
        self.log_dir = log_dir
        self.filename_prefix = filename_prefix
        self.current_date = ""
        self.stream = None
        self.log_dir.mkdir(parents=True, exist_ok=True)
        self._open_for_today()

    def emit(self, record: LogRecord) -> None:
        try:
            today = datetime.now().strftime("%Y-%m-%d")
            if today != self.current_date:
                self._open_for_today()
            message = self.format(record)
            self.stream.write(message + self.terminator)
            self.flush()
        except Exception:
            self.handleError(record)

    def flush(self) -> None:
        if self.stream and not self.stream.closed:
            self.stream.flush()

    def close(self) -> None:
        try:
            if self.stream and not self.stream.closed:
                self.stream.close()
        finally:
            super().close()

    @property
    def terminator(self) -> str:
        return "\n"

    def _open_for_today(self) -> None:
        if self.stream and not self.stream.closed:
            self.stream.close()
        self.current_date = datetime.now().strftime("%Y-%m-%d")
        log_file = self.log_dir / f"{self.filename_prefix}-{self.current_date}.log"
        self.stream = log_file.open("a", encoding="utf-8")


def setup_logging(settings: Settings) -> None:
    root_logger = logging.getLogger()
    if getattr(root_logger, "_styleforge_logging_configured", False):
        return

    log_level = getattr(logging, settings.log_level.upper(), logging.INFO)
    root_logger.setLevel(log_level)

    formatter = logging.Formatter(LOG_FORMAT, datefmt=DATE_FORMAT)
    request_id_filter = RequestIdFilter()

    for handler in list(root_logger.handlers):
        root_logger.removeHandler(handler)

    console_handler = StreamHandler()
    console_handler.setFormatter(formatter)
    console_handler.addFilter(request_id_filter)
    console_handler.setLevel(log_level)

    log_dir = _resolve_log_dir(settings.log_dir)
    _cleanup_old_logs(log_dir, settings.log_retention_days)

    file_handler = DailyFileHandler(log_dir)
    file_handler.setFormatter(formatter)
    file_handler.addFilter(request_id_filter)
    file_handler.setLevel(log_level)

    root_logger.addHandler(console_handler)
    root_logger.addHandler(file_handler)
    root_logger._styleforge_logging_configured = True


def _resolve_log_dir(log_dir: str) -> Path:
    path = Path(log_dir)
    if path.is_absolute():
        return path
    backend_root = Path(__file__).resolve().parents[2]
    return backend_root / path


def _cleanup_old_logs(log_dir: Path, retention_days: int) -> None:
    if not log_dir.exists():
        return
    cutoff = datetime.now() - timedelta(days=retention_days)
    for log_file in log_dir.glob("styleforge-*.log"):
        try:
            if datetime.fromtimestamp(log_file.stat().st_mtime) < cutoff:
                log_file.unlink()
        except OSError:
            logging.getLogger(__name__).warning("failed to delete old log file %s", log_file)
