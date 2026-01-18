import json
import time
from storage import get_conn
from config import DEFAULT_WINDOW_MINUTES


def _clamp(x, lo, hi):
    return max(lo, min(hi, x))


def _normalize_payload(payload):
    """
    payload_json from mysql may come as:
    - dict (already parsed)
    - str (JSON string)
    - bytes/bytearray (JSON bytes)
    """
    if payload is None:
        return None

    # if it is already a dict
    if isinstance(payload, dict):
        return payload

    # if it comes as bytes
    if isinstance(payload, (bytes, bytearray)):
        try:
            payload = payload.decode("utf-8")
        except Exception:
            # fallback decode
            payload = payload.decode(errors="ignore")

    # if it comes as str JSON
    if isinstance(payload, str):
        payload = payload.strip()
        if payload == "":
            return None
        try:
            return json.loads(payload)
        except json.JSONDecodeError:
            # if payload is not valid json
            return None

    # Unknown datatype
    return None


def compute_indices(window_minutes: int = DEFAULT_WINDOW_MINUTES):
    conn = None
    cur = None

    try:
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

            payload = _normalize_payload(r.get("payload_json"))

            # Only store valid payloads
            if payload is not None:
                latest[(r["zone_id"], r["source_type"])] = payload

        out = []
        for zid in sorted(zone_ids):
            traffic = latest.get((zid, "traffic"))
            weather = latest.get((zid, "weather"))
            health = latest.get((zid, "health"))
            agri = latest.get((zid, "agri"))

            # If any missing -> skip zone
            if not (traffic and weather and health and agri):
                continue

            # Safety checks (avoid crash if some key missing)
            try:
                volume = float(traffic.get("volume", 0))
                speed = float(traffic.get("avg_speed", 0))
            except Exception:
                continue

            congestion = (volume / 1200) * 60 + (1 - (speed / 60)) * 50
            congestion = _clamp(congestion, 0, 100)
            congestion_exp = f"Derived from volume={volume:.0f}, speed={speed:.1f} km/h"

            try:
                temp = float(weather.get("temp_c", 0))
                hum = float(weather.get("humidity", 0))
            except Exception:
                continue

            heat = (temp - 25) * 6 + (hum - 40) * 0.9
            heat = _clamp(heat, 0, 100)
            heat_exp = f"Derived from temp={temp:.1f}C, humidity={hum:.0f}%"

            try:
                supply = float(agri.get("supply_units", 0))
                price = float(agri.get("price_index", 100))
            except Exception:
                continue

            food = (1 - (supply / 1800)) * 70 + ((price - 100) / 30) * 50
            food = _clamp(food, 0, 100)
            food_exp = f"Derived from supply={supply:.0f}, price_index={price:.1f}"

            try:
                vuln = float(health.get("baseline_vulnerability", 0))
            except Exception:
                continue

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
        return len(out)

    finally:
        # Always close resources even if crash happens
        try:
            if cur:
                cur.close()
        except Exception:
            pass

        try:
            if conn:
                conn.close()
        except Exception:
            pass
