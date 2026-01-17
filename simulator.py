import time
import numpy as np
from zones import ZONES

def now_ts():
    return int(time.time())

def _clamp(x, lo, hi):
    return max(lo, min(hi, x))

def generate_events():
    ts = now_ts()
    events = []
    hour = (ts // 3600) % 24
    peak = 1.0 if (8 <= hour <= 10 or 17 <= hour <= 19) else 0.6

    for z in ZONES:
        zid = z["zone_id"]

        base_volume = 800 * z["pop_density"] + 200
        volume = base_volume * peak * np.random.uniform(0.8, 1.2)
        speed = 45 - (volume / 1000) * 20 + np.random.uniform(-3, 3)
        speed = _clamp(speed, 5, 60)
        events.append({
            "ts": ts, "zone_id": zid, "source_type": "traffic",
            "payload": {"volume": float(volume), "avg_speed": float(speed)}
        })

        base_temp = 30 + np.random.uniform(-1.5, 1.5)
        temp = base_temp + (z["type"] in ["industrial", "commercial"]) * np.random.uniform(0.5, 1.5)
        humidity = 55 + np.random.uniform(-10, 10)
        rainfall = 0.0 if np.random.random() > 0.9 else float(np.random.uniform(0, 15))
        events.append({
            "ts": ts, "zone_id": zid, "source_type": "weather",
            "payload": {"temp_c": float(temp), "humidity": float(humidity), "rain_mm": rainfall}
        })

        vulnerability = z["baseline_vulnerability"] + np.random.uniform(-0.02, 0.02)
        vulnerability = _clamp(vulnerability, 0.0, 1.0)
        events.append({
            "ts": ts, "zone_id": zid, "source_type": "health",
            "payload": {"baseline_vulnerability": float(vulnerability)}
        })

        base_supply = 1000 + (z["type"] == "agri") * 700 + np.random.uniform(-120, 120)
        price_index = 100 + (z["logistics_dependency"] * 15) + np.random.uniform(-3, 3)
        events.append({
            "ts": ts, "zone_id": zid, "source_type": "agri",
            "payload": {"supply_units": float(base_supply), "price_index": float(price_index)}
        })

    return events
