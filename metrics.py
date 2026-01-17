import json
import time
from storage import get_conn
from config import DEFAULT_WINDOW_MINUTES

def _clamp(x, lo, hi):
    return max(lo, min(hi, x))

def compute_indices(window_minutes: int = DEFAULT_WINDOW_MINUTES):
    conn = get_conn()
    cur = conn.cursor(dictionary=True)

    now = int(time.time())
    start_ts = now - window_minutes * 60

    # Latest event per zone per source within window
    cur.execute("""
    SELECT e.zone_id, e.source_type, e.payload_json
    FROM events e
    JOIN (
        SELECT zone_id, source_type, MAX(ts) AS max_ts
        FROM events
        WHERE ts >= %s
        GROUP BY zone_id, source_type
    ) t
    ON e.zone_id = t.zone_id AND e.source_type = t.source_type AND e.ts = t.max_ts
    """, (start_ts,))

    rows = cur.fetchall()

    latest = {}
    zone_ids = set()
    for r in rows:
        zone_ids.add(r["zone_id"])
        payload = r["payload_json"]
        # mysql-connector returns JSON as dict already; but handle str just in case
        if isinstance(payload, str):
            payload = json.loads(payload)
        latest[(r["zone_id"], r["source_type"])] = payload

    out = []
    for zid in sorted(zone_ids):
        traffic = latest.get((zid, "traffic"))
        weather = latest.get((zid, "weather"))
        health = latest.get((zid, "health"))
        agri = latest.get((zid, "agri"))
        if not (traffic and weather and health and agri):
            continue

        volume = float(traffic["volume"])
        speed = float(traffic["avg_speed"])
        congestion = (volume / 1200) * 60 + (1 - (speed / 60)) * 50
        congestion = _clamp(congestion, 0, 100)
        congestion_exp = f"Derived from volume={volume:.0f}, speed={speed:.1f} km/h"

        temp = float(weather["temp_c"])
        hum = float(weather["humidity"])
        heat = (temp - 25) * 6 + (hum - 40) * 0.9
        heat = _clamp(heat, 0, 100)
        heat_exp = f"Derived from temp={temp:.1f}C, humidity={hum:.0f}%"

        supply = float(agri["supply_units"])
        price = float(agri["price_index"])
        food = (1 - (supply / 1800)) * 70 + ((price - 100) / 30) * 50
        food = _clamp(food, 0, 100)
        food_exp = f"Derived from supply={supply:.0f}, price_index={price:.1f}"

        vuln = float(health["baseline_vulnerability"])
        health_risk = (vuln * 45) + (heat * 0.35) + (congestion * 0.20)
        health_risk = _clamp(health_risk, 0, 100)
        hr_exp = f"Baseline vuln={vuln:.2f} + heat + congestion"

        out.extend([
            (now, zid, "congestion_index", float(congestion), congestion_exp),
            (now, zid, "heat_risk", float(heat), heat_exp),
            (now, zid, "food_stress", float(food), food_exp),
            (now, zid, "health_risk", float(health_risk), hr_exp),
        ])

    if out:
        cur.executemany("""
        INSERT INTO metrics (ts, zone_id, metric_name, value, explanation)
        VALUES (%s, %s, %s, %s, %s)
        """, out)

    conn.commit()
    cur.close()
    conn.close()
    return len(out)
