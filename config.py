import os

# MySQL connection
DB_HOST = os.environ.get("DB_HOST", "127.0.0.1")
DB_PORT = int(os.environ.get("DB_PORT", "3307"))
DB_USER = os.environ.get("DB_USER", "root")
DB_PASSWORD = os.environ.get("DB_PASSWORD", "")
DB_NAME = os.environ.get("DB_NAME", "smartcity")

# Scheduler intervals
INGEST_INTERVAL_SECONDS = int(os.environ.get("INGEST_INTERVAL_SECONDS", "5"))
PROCESS_INTERVAL_SECONDS = int(os.environ.get("PROCESS_INTERVAL_SECONDS", "10"))

# Processing window
DEFAULT_WINDOW_MINUTES = int(os.environ.get("DEFAULT_WINDOW_MINUTES", "60"))
