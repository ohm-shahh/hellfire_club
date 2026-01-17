import mysql.connector
from mysql.connector import pooling
from config import DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME

_pool = None

def init_pool():
    global _pool
    if _pool is None:
        _pool = pooling.MySQLConnectionPool(
            pool_name="smartcity_pool",
            pool_size=5,
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME,
            autocommit=False,
        )

def get_conn():
    if _pool is None:
        init_pool()
    return _pool.get_connection()

def init_db():
    """
    Assumes the database DB_NAME already exists.
    Creates tables + indexes.
    """
    conn = get_conn()
    cur = conn.cursor()

    cur.execute("""
    CREATE TABLE IF NOT EXISTS events (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    ts BIGINT NOT NULL,
    zone_id VARCHAR(10) NOT NULL,
    source_type VARCHAR(20) NOT NULL,
    payload_json LONGTEXT NOT NULL
    ) ENGINE=InnoDB;
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS metrics (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    ts BIGINT NOT NULL,
    zone_id VARCHAR(10) NOT NULL,
    metric_name VARCHAR(40) NOT NULL,
    value DOUBLE NOT NULL,
    explanation VARCHAR(255)
    ) ENGINE=InnoDB;
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS scenarios (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    ts BIGINT NOT NULL,
    scenario_name VARCHAR(50) NOT NULL,
    params_json LONGTEXT NOT NULL,
    result_json LONGTEXT NOT NULL
    ) ENGINE=InnoDB;
    """)

    # # Indexes
    # cur.execute("CREATE INDEX IF NOT EXISTS idx_events_ts ON events(ts);")
    # cur.execute("CREATE INDEX IF NOT EXISTS idx_metrics_ts ON metrics(ts);")
    # cur.execute("CREATE INDEX IF NOT EXISTS idx_metrics_zone_metric_ts ON metrics(zone_id, metric_name, ts);")

    conn.commit()
    cur.close()
    conn.close()
