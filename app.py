import json
from flask import Flask, jsonify, request, render_template
from apscheduler.schedulers.background import BackgroundScheduler

from storage import init_db, get_conn, init_pool
from simulator import generate_events
from metrics import compute_indices
from scenarios import run_scenario
from zones import ZONES
from config import INGEST_INTERVAL_SECONDS, PROCESS_INTERVAL_SECONDS, DEFAULT_WINDOW_MINUTES
from io import BytesIO
from flask import send_file
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas


app = Flask(__name__)


# ----------------------------
# Scheduler jobs
# ----------------------------
def ingest_once() -> int:
    conn = get_conn()
    cur = conn.cursor()
    try:
        events = generate_events()
        cur.executemany(
            """
            INSERT INTO events (ts, zone_id, source_type, payload_json)
            VALUES (%s, %s, %s, %s)
            """,
            [(e["ts"], e["zone_id"], e["source_type"], json.dumps(e["payload"])) for e in events],
        )
        conn.commit()
        return len(events)
    finally:
        cur.close()
        conn.close()


def process_once() -> int:
    # compute_indices handles its own DB connection
    return compute_indices(DEFAULT_WINDOW_MINUTES)


def start_scheduler():
    sched = BackgroundScheduler(daemon=True)
    sched.add_job(ingest_once, "interval", seconds=INGEST_INTERVAL_SECONDS, id="ingest")
    sched.add_job(process_once, "interval", seconds=PROCESS_INTERVAL_SECONDS, id="process")
    sched.start()
    return sched


# ----------------------------
# UI
# ----------------------------
@app.route("/")
def index():
    return render_template("index.html", zones=ZONES)


# ----------------------------
# REPORTS (HTML page)
# ----------------------------
def get_latest_snapshot():
    """
    Pulls latest metrics + alerts + zone summary + recent scenarios.
    Returns a dict safe to render in HTML.
    """
    conn = get_conn()
    cur = conn.cursor(dictionary=True)

    try:
        # Latest metrics timestamp
        cur.execute("SELECT MAX(ts) AS ts FROM metrics")
        ts_row = cur.fetchone()
        if not ts_row or ts_row["ts"] is None:
            return {"status": "no_metrics_yet"}

        ts = int(ts_row["ts"])

        # City KPI averages
        cur.execute(
            """
            SELECT metric_name, AVG(value) AS avg_value
            FROM metrics
            WHERE ts = %s
            GROUP BY metric_name
            """,
            (ts,),
        )
        city = {r["metric_name"]: round(float(r["avg_value"]), 2) for r in cur.fetchall()}

        # Alerts: top zones by health risk
        cur.execute(
            """
            SELECT zone_id, value
            FROM metrics
            WHERE ts = %s AND metric_name = 'health_risk'
            ORDER BY value DESC
            LIMIT 5
            """,
            (ts,),
        )
        alerts = [{"zone_id": r["zone_id"], "health_risk": round(float(r["value"]), 2)} for r in cur.fetchall()]

        # Zone summary table
        cur.execute(
            """
            SELECT zone_id,
                   MAX(CASE WHEN metric_name='congestion_index' THEN value END) AS congestion_index,
                   MAX(CASE WHEN metric_name='heat_risk' THEN value END) AS heat_risk,
                   MAX(CASE WHEN metric_name='food_stress' THEN value END) AS food_stress,
                   MAX(CASE WHEN metric_name='health_risk' THEN value END) AS health_risk
            FROM metrics
            WHERE ts = %s
            GROUP BY zone_id
            ORDER BY zone_id
            """,
            (ts,),
        )
        zones_summary = []
        for r in cur.fetchall():
            zones_summary.append({
                "zone_id": r["zone_id"],
                "congestion_index": round(float(r["congestion_index"] or 0), 2),
                "heat_risk": round(float(r["heat_risk"] or 0), 2),
                "food_stress": round(float(r["food_stress"] or 0), 2),
                "health_risk": round(float(r["health_risk"] or 0), 2),
            })

        # Recent scenarios (optional)
        cur.execute(
            """
            SELECT ts, scenario_name, params_json, result_json
            FROM scenarios
            ORDER BY ts DESC
            LIMIT 5
            """
        )
        scenarios = []
        for r in cur.fetchall():
            params = r["params_json"]
            result = r["result_json"]

            # mysql connector may return dict or string; handle both
            if isinstance(params, str):
                params = json.loads(params)
            if isinstance(result, str):
                result = json.loads(result)

            scenarios.append({
                "ts": int(r["ts"]),
                "scenario_name": r["scenario_name"],
                "params": params,
                "result": result,
            })

        return {
            "status": "ok",
            "ts": ts,
            "city": city,
            "alerts": alerts,
            "zones_summary": zones_summary,
            "scenarios": scenarios,
        }

    finally:
        cur.close()
        conn.close()


@app.route("/reports")
def reports():
    snapshot = get_latest_snapshot()
    return render_template("reports.html", zones=ZONES, snapshot=snapshot)


# ----------------------------
# APIs
# ----------------------------
@app.route("/api/zones")
def api_zones():
    return jsonify({"zones": ZONES})


@app.route("/api/kpis/current")
def api_kpis_current():
    conn = get_conn()
    cur = conn.cursor(dictionary=True)
    try:
        cur.execute("SELECT MAX(ts) AS ts FROM metrics")
        ts_row = cur.fetchone()
        if not ts_row or ts_row["ts"] is None:
            return jsonify({"status": "no_metrics_yet"}), 200

        ts = int(ts_row["ts"])

        # City-level KPI averages
        cur.execute(
            """
            SELECT metric_name, AVG(value) AS avg_value
            FROM metrics
            WHERE ts = %s
            GROUP BY metric_name
            """,
            (ts,),
        )
        city = {r["metric_name"]: round(float(r["avg_value"]), 2) for r in cur.fetchall()}

        # Alerts: top zones by health risk
        cur.execute(
            """
            SELECT zone_id, value
            FROM metrics
            WHERE ts = %s AND metric_name = 'health_risk'
            ORDER BY value DESC
            LIMIT 5
            """,
            (ts,),
        )
        alerts = [{"zone_id": r["zone_id"], "health_risk": round(float(r["value"]), 2)} for r in cur.fetchall()]

        return jsonify({"ts": ts, "city": city, "alerts": alerts})
    finally:
        cur.close()
        conn.close()


@app.route("/api/zones/summary")
def api_zones_summary():
    conn = get_conn()
    cur = conn.cursor(dictionary=True)
    try:
        cur.execute("SELECT MAX(ts) AS ts FROM metrics")
        ts_row = cur.fetchone()
        if not ts_row or ts_row["ts"] is None:
            return jsonify({"status": "no_metrics_yet"}), 200

        ts = int(ts_row["ts"])

        cur.execute(
            """
            SELECT zone_id,
                   MAX(CASE WHEN metric_name='congestion_index' THEN value END) AS congestion_index,
                   MAX(CASE WHEN metric_name='heat_risk' THEN value END) AS heat_risk,
                   MAX(CASE WHEN metric_name='food_stress' THEN value END) AS food_stress,
                   MAX(CASE WHEN metric_name='health_risk' THEN value END) AS health_risk
            FROM metrics
            WHERE ts = %s
            GROUP BY zone_id
            """,
            (ts,),
        )

        zones = []
        for r in cur.fetchall():
            zones.append({
                "zone_id": r["zone_id"],
                "congestion_index": round(float(r["congestion_index"] or 0), 2),
                "heat_risk": round(float(r["heat_risk"] or 0), 2),
                "food_stress": round(float(r["food_stress"] or 0), 2),
                "health_risk": round(float(r["health_risk"] or 0), 2),
            })

        return jsonify({"ts": ts, "zones": zones})
    finally:
        cur.close()
        conn.close()


@app.route("/api/metrics/timeseries")
def api_metrics_timeseries():
    zone_id = request.args.get("zone_id")
    metric = request.args.get("metric")
    limit = int(request.args.get("limit", "60"))

    if not zone_id or not metric:
        return jsonify({"error": "zone_id and metric are required"}), 400

    conn = get_conn()
    cur = conn.cursor(dictionary=True)
    try:
        cur.execute(
            """
            SELECT ts, value
            FROM metrics
            WHERE zone_id = %s AND metric_name = %s
            ORDER BY ts DESC
            LIMIT %s
            """,
            (zone_id, metric, limit),
        )
        rows = cur.fetchall()
        series = [{"ts": int(r["ts"]), "value": float(r["value"])} for r in reversed(rows)]
        return jsonify({"zone_id": zone_id, "metric": metric, "series": series})
    finally:
        cur.close()
        conn.close()


@app.route("/api/scenario/run", methods=["POST"])
def api_scenario_run():
    body = request.get_json(force=True) or {}
    scenario_name = body.get("scenario_name")
    params = body.get("params", {})
    target_zones = body.get("target_zones")  # optional list

    allowed = {"reduce_peak_traffic", "heatwave", "supply_disruption"}
    if scenario_name not in allowed:
        return jsonify({"error": f"scenario_name must be one of: {', '.join(sorted(allowed))}"}), 400

    result = run_scenario(scenario_name, params, target_zones)

    if isinstance(result, dict) and result.get("error") == "no_metrics_yet":
        return jsonify({"status": "no_metrics_yet"}), 200

    return jsonify(result)

@app.route("/reports/download")
def download_report_pdf():
    conn = get_conn()
    cur = conn.cursor(dictionary=True)

    # latest ts
    cur.execute("SELECT MAX(ts) AS ts FROM metrics")
    ts_row = cur.fetchone()
    if not ts_row or ts_row["ts"] is None:
        cur.close(); conn.close()
        return "No metrics yet. Wait 10–20 seconds and refresh.", 400

    ts = int(ts_row["ts"])

    # City KPI averages
    cur.execute("""
        SELECT metric_name, AVG(value) AS avg_value
        FROM metrics
        WHERE ts = %s
        GROUP BY metric_name
    """, (ts,))
    city_rows = cur.fetchall()

    # Top alerts
    cur.execute("""
        SELECT zone_id, value
        FROM metrics
        WHERE ts = %s AND metric_name = 'health_risk'
        ORDER BY value DESC
        LIMIT 5
    """, (ts,))
    alert_rows = cur.fetchall()

    # Zone summary
    cur.execute("""
        SELECT zone_id,
               MAX(CASE WHEN metric_name='congestion_index' THEN value END) AS congestion_index,
               MAX(CASE WHEN metric_name='heat_risk' THEN value END) AS heat_risk,
               MAX(CASE WHEN metric_name='food_stress' THEN value END) AS food_stress,
               MAX(CASE WHEN metric_name='health_risk' THEN value END) AS health_risk
        FROM metrics
        WHERE ts = %s
        GROUP BY zone_id
        ORDER BY zone_id
    """, (ts,))
    zone_rows = cur.fetchall()

    cur.close()
    conn.close()

    # ---- Build PDF in memory ----
    buf = BytesIO()
    c = canvas.Canvas(buf, pagesize=A4)
    width, height = A4

    y = height - 60
    c.setFont("Helvetica-Bold", 18)
    c.drawString(50, y, "Smart City Report")
    y -= 25

    c.setFont("Helvetica", 11)
    c.drawString(50, y, f"Report Timestamp: {ts}")
    y -= 30

    # City KPIs
    c.setFont("Helvetica-Bold", 13)
    c.drawString(50, y, "City KPIs (Averages)")
    y -= 18

    c.setFont("Helvetica", 11)
    for r in city_rows:
        line = f"{r['metric_name']}: {round(float(r['avg_value']), 2)}"
        c.drawString(60, y, line)
        y -= 16
        if y < 80:
            c.showPage()
            y = height - 60
            c.setFont("Helvetica", 11)

    y -= 10

    # Alerts
    c.setFont("Helvetica-Bold", 13)
    c.drawString(50, y, "Top Alerts (Highest Health Risk)")
    y -= 18
    c.setFont("Helvetica", 11)

    for i, r in enumerate(alert_rows, start=1):
        line = f"{i}. {r['zone_id']} — Health Risk: {round(float(r['value']), 2)}"
        c.drawString(60, y, line)
        y -= 16
        if y < 80:
            c.showPage()
            y = height - 60
            c.setFont("Helvetica", 11)

    y -= 10

    # Zones summary table (simple rows)
    c.setFont("Helvetica-Bold", 13)
    c.drawString(50, y, "Zones Summary")
    y -= 18

    c.setFont("Helvetica-Bold", 10)
    c.drawString(50, y, "Zone")
    c.drawString(110, y, "Congestion")
    c.drawString(200, y, "Heat Risk")
    c.drawString(280, y, "Food Stress")
    c.drawString(370, y, "Health Risk")
    y -= 14
    c.setFont("Helvetica", 10)

    for r in zone_rows:
        c.drawString(50, y, str(r["zone_id"]))
        c.drawString(110, y, str(round(float(r["congestion_index"] or 0), 2)))
        c.drawString(200, y, str(round(float(r["heat_risk"] or 0), 2)))
        c.drawString(280, y, str(round(float(r["food_stress"] or 0), 2)))
        c.drawString(370, y, str(round(float(r["health_risk"] or 0), 2)))
        y -= 14

        if y < 80:
            c.showPage()
            y = height - 60
            c.setFont("Helvetica", 10)

    c.save()
    buf.seek(0)

    return send_file(
        buf,
        as_attachment=True,
        download_name="smart_city_report.pdf",
        mimetype="application/pdf"
    )

# ----------------------------
# Main
# ----------------------------
if __name__ == "__main__":
    init_pool()
    init_db()
    start_scheduler()
    app.run(host="0.0.0.0", port=5000, debug=True)
