import json
import time
from storage import get_conn

def run_scenario(scenario_name: str, params: dict, target_zones=None):
    conn = get_conn()
    cur = conn.cursor(dictionary=True)

    # latest metrics timestamp
    cur.execute("SELECT MAX(ts) AS ts FROM metrics")
    ts_row = cur.fetchone()
    if not ts_row or ts_row["ts"] is None:
        cur.close()
        conn.close()
        return {"error": "no_metrics_yet"}

    ts = int(ts_row["ts"])

    cur.execute("""
    SELECT zone_id, metric_name, value
    FROM metrics
    WHERE ts = %s
    """, (ts,))
    rows = cur.fetchall()

    baseline = {}
    for r in rows:
        zid = r["zone_id"]
        baseline.setdefault(zid, {})[r["metric_name"]] = float(r["value"])

    if target_zones:
        baseline = {z: baseline[z] for z in baseline.keys() if z in set(target_zones)}

    scenario = {}
    for zid, m in baseline.items():
        cong = m.get("congestion_index", 0.0)
        heat = m.get("heat_risk", 0.0)
        food = m.get("food_stress", 0.0)
        hr = m.get("health_risk", 0.0)

        cong2, heat2, food2, hr2 = cong, heat, food, hr

        if scenario_name == "reduce_peak_traffic":
            pct = float(params.get("traffic_reduction_pct", 0))
            factor = max(0.0, 1 - pct / 100.0)
            cong2 = cong * factor
            hr2 = max(0.0, hr - (cong - cong2) * 0.15)

        elif scenario_name == "heatwave":
            inc = float(params.get("temp_increase_c", 0))
            heat2 = min(100.0, heat + inc * 8.0)
            hr2 = min(100.0, hr + inc * 4.0)

        elif scenario_name == "supply_disruption":
            pct = float(params.get("supply_drop_pct", 0))
            food2 = min(100.0, food + pct * 0.6)
            hr2 = min(100.0, hr + pct * 0.15)

        scenario[zid] = {
            "congestion_index": round(cong2, 2),
            "heat_risk": round(heat2, 2),
            "food_stress": round(food2, 2),
            "health_risk": round(hr2, 2),
        }

    result = {
        "scenario_name": scenario_name,
        "params": params,
        "baseline": baseline,
        "scenario": scenario,
        "timestamp": int(time.time()),
    }

    cur.execute("""
    INSERT INTO scenarios (ts, scenario_name, params_json, result_json)
    VALUES (%s, %s, %s, %s)
    """, (result["timestamp"], scenario_name, json.dumps(params), json.dumps(result)))


    conn.commit()
    cur.close()
    conn.close()
    return result
