import json
import time
from flask import Flask, jsonify, request
from flask_cors import CORS
from apscheduler.schedulers.background import BackgroundScheduler

from storage import init_db, get_conn, init_pool
from simulator import generate_events
from metrics import compute_indices
from scenarios import run_scenario
from zones import ZONES
from config import INGEST_INTERVAL_SECONDS, PROCESS_INTERVAL_SECONDS, DEFAULT_WINDOW_MINUTES
from auth import register_user, login_user, get_user_from_token, require_auth
from correlation_engine import correlation_engine
from io import BytesIO
from flask import send_file
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas


app = Flask(__name__)
# Enable CORS for React frontend - allow all origins in development
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)


# ----------------------------
# Health Check
# ----------------------------
@app.route("/health", methods=["GET"])
def health():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "service": "smartcity-api"})


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
# Root/Health Check Routes
# ----------------------------
@app.route("/")
def index():
    """Root endpoint - React frontend serves the UI"""
    return jsonify({
        "message": "Smart City API Server",
        "version": "1.0.0",
        "docs": "API endpoints available at /api/*",
        "frontend": "React app runs on http://localhost:5173",
        "status": "running"
    })


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
    """Reports endpoint - returns JSON data instead of HTML template"""
    snapshot = get_latest_snapshot()
    return jsonify({
        "zones": ZONES,
        "snapshot": snapshot
    })


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
# Authentication API Endpoints
# ----------------------------
@app.route("/api/auth/register", methods=["POST"])
def api_auth_register():
    data = request.get_json() or {}
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")
    
    if not username or not email or not password:
        return jsonify({"error": "username, email, and password are required"}), 400
    
    result = register_user(username, email, password)
    
    if "error" in result:
        return jsonify(result), 400
    
    return jsonify(result), 201


@app.route("/api/auth/login", methods=["POST"])
def api_auth_login():
    data = request.get_json() or {}
    username = data.get("username")
    password = data.get("password")
    
    if not username or not password:
        return jsonify({"error": "username and password are required"}), 400
    
    result = login_user(username, password)
    
    if "error" in result:
        return jsonify(result), 401
    
    return jsonify(result)


@app.route("/api/auth/logout", methods=["POST"])
def api_auth_logout():
    # JWT tokens are stateless, so logout is handled client-side
    return jsonify({"success": True, "message": "Logged out"})


@app.route("/api/auth/user", methods=["GET"])
@require_auth
def api_auth_user():
    # User is available via request.current_user from require_auth decorator
    user = request.current_user
    return jsonify({
        "id": user["id"],
        "username": user["username"],
        "email": user["email"],
        "role": user.get("role", "user")
    })


# ----------------------------
# Events API Endpoints
# ----------------------------
@app.route("/api/events", methods=["GET"])
def api_events():
    zone_id = request.args.get("zone_id")
    source_type = request.args.get("source_type")
    start_ts = request.args.get("start_ts")
    end_ts = request.args.get("end_ts")
    
    conn = get_conn()
    cur = conn.cursor(dictionary=True)
    
    try:
        query = "SELECT id, ts, zone_id, source_type, payload_json FROM events WHERE 1=1"
        params = []
        
        if zone_id:
            query += " AND zone_id = %s"
            params.append(zone_id)
        if source_type:
            query += " AND source_type = %s"
            params.append(source_type)
        if start_ts:
            query += " AND ts >= %s"
            params.append(int(start_ts))
        if end_ts:
            query += " AND ts <= %s"
            params.append(int(end_ts))
        
        query += " ORDER BY ts DESC LIMIT 1000"
        
        cur.execute(query, params)
        rows = cur.fetchall()
        
        events = []
        for row in rows:
            payload = row["payload_json"]
            # Handle different payload formats (str, bytes, dict)
            if isinstance(payload, bytes):
                payload = json.loads(payload.decode('utf-8'))
            elif isinstance(payload, str):
                payload = json.loads(payload)
            elif payload is None:
                payload = {}
            
            events.append({
                "id": row["id"],
                "ts": int(row["ts"]),
                "zone_id": row["zone_id"],
                "source_type": row["source_type"],
                "payload": payload
            })
        
        return jsonify({"events": events, "count": len(events)})
    finally:
        cur.close()
        conn.close()


@app.route("/api/events", methods=["POST"])
def api_events_create():
    data = request.get_json() or {}
    
    ts = data.get("ts", int(time.time()))
    zone_id = data.get("zone_id")
    source_type = data.get("source_type")
    payload = data.get("payload", {})
    
    if not zone_id or not source_type:
        return jsonify({"error": "zone_id and source_type are required"}), 400
    
    conn = get_conn()
    cur = conn.cursor()
    
    try:
        cur.execute(
            "INSERT INTO events (ts, zone_id, source_type, payload_json) VALUES (%s, %s, %s, %s)",
            (ts, zone_id, source_type, json.dumps(payload))
        )
        conn.commit()
        event_id = cur.lastrowid
        
        return jsonify({
            "success": True,
            "id": event_id,
            "ts": ts,
            "zone_id": zone_id,
            "source_type": source_type
        }), 201
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        cur.close()
        conn.close()


# ----------------------------
# Metrics API Endpoints
# ----------------------------
@app.route("/api/metrics", methods=["GET"])
def api_metrics():
    zone_id = request.args.get("zone_id")
    metric_name = request.args.get("metric_name")
    start_ts = request.args.get("start_ts")
    end_ts = request.args.get("end_ts")
    
    conn = get_conn()
    cur = conn.cursor(dictionary=True)
    
    try:
        query = "SELECT id, ts, zone_id, metric_name, value, explanation FROM metrics WHERE 1=1"
        params = []
        
        if zone_id:
            query += " AND zone_id = %s"
            params.append(zone_id)
        if metric_name:
            query += " AND metric_name = %s"
            params.append(metric_name)
        if start_ts:
            query += " AND ts >= %s"
            params.append(int(start_ts))
        if end_ts:
            query += " AND ts <= %s"
            params.append(int(end_ts))
        
        query += " ORDER BY ts DESC LIMIT 1000"
        
        cur.execute(query, params)
        rows = cur.fetchall()
        
        metrics = []
        for row in rows:
            metrics.append({
                "id": row["id"],
                "ts": int(row["ts"]),
                "zone_id": row["zone_id"],
                "metric_name": row["metric_name"],
                "value": float(row["value"]),
                "explanation": row.get("explanation")
            })
        
        return jsonify({"metrics": metrics, "count": len(metrics)})
    finally:
        cur.close()
        conn.close()


@app.route("/api/metrics/summary", methods=["GET"])
def api_metrics_summary():
    """Get latest metrics summary for all zones"""
    conn = get_conn()
    cur = conn.cursor(dictionary=True)
    
    try:
        cur.execute("SELECT MAX(ts) AS ts FROM metrics")
        ts_row = cur.fetchone()
        if not ts_row or ts_row["ts"] is None:
            return jsonify({"status": "no_metrics_yet"}), 200
        
        ts = int(ts_row["ts"])
        
        cur.execute("""
            SELECT zone_id, metric_name, value, explanation
            FROM metrics
            WHERE ts = %s
            ORDER BY zone_id, metric_name
        """, (ts,))
        
        rows = cur.fetchall()
        
        summary = {}
        for row in rows:
            zone_id = row["zone_id"]
            if zone_id not in summary:
                summary[zone_id] = {}
            summary[zone_id][row["metric_name"]] = {
                "value": float(row["value"]),
                "explanation": row.get("explanation")
            }
        
        return jsonify({
            "ts": ts,
            "zones": summary
        })
    finally:
        cur.close()
        conn.close()


# ----------------------------
# Correlation API Endpoints
# ----------------------------
@app.route("/api/correlations/matrix", methods=["GET"])
def api_correlations_matrix():
    """Get correlation matrix between all domains"""
    zone_id = request.args.get("zone_id")
    
    try:
        result = correlation_engine.compute_correlation_matrix(zone_id=zone_id)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/correlations/insights", methods=["GET"])
def api_correlations_insights():
    """Get key insights about domain interactions"""
    zone_id = request.args.get("zone_id")
    
    try:
        result = correlation_engine.get_correlation_insights(zone_id=zone_id)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/correlations/impact", methods=["GET"])
def api_correlations_impact():
    """Show how one domain affects another"""
    source_domain = request.args.get("source_domain")
    target_domain = request.args.get("target_domain")
    source_change = request.args.get("source_change", type=float)
    
    if not source_domain or not target_domain:
        return jsonify({"error": "source_domain and target_domain are required"}), 400
    
    try:
        if source_change is not None:
            result = correlation_engine.quantify_impact(source_domain, target_domain, source_change)
        else:
            # Return lag correlation analysis
            result = correlation_engine.compute_time_lagged_correlations(source_domain, target_domain)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/correlations/analyze", methods=["POST"])
def api_correlations_analyze():
    """Trigger correlation analysis on recent data"""
    data = request.get_json() or {}
    zone_id = data.get("zone_id")
    
    try:
        # Compute matrix and insights
        matrix_result = correlation_engine.compute_correlation_matrix(zone_id=zone_id)
        insights_result = correlation_engine.get_correlation_insights(zone_id=zone_id)
        
        return jsonify({
            "matrix": matrix_result,
            "insights": insights_result,
            "timestamp": int(time.time())
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ----------------------------
# Scenarios API Endpoints (updated)
# ----------------------------
@app.route("/api/scenarios", methods=["GET"])
def api_scenarios():
    """Get scenarios"""
    scenario_name = request.args.get("scenario_name")
    limit = int(request.args.get("limit", "50"))
    
    conn = get_conn()
    cur = conn.cursor(dictionary=True)
    
    try:
        query = "SELECT id, ts, scenario_name, params_json, result_json FROM scenarios WHERE 1=1"
        params = []
        
        if scenario_name:
            query += " AND scenario_name = %s"
            params.append(scenario_name)
        
        query += " ORDER BY ts DESC LIMIT %s"
        params.append(limit)
        
        cur.execute(query, params)
        rows = cur.fetchall()
        
        scenarios = []
        for row in rows:
            params_json = row["params_json"]
            result_json = row["result_json"]
            
            if isinstance(params_json, str):
                params_json = json.loads(params_json)
            if isinstance(result_json, str):
                result_json = json.loads(result_json)
            
            scenarios.append({
                "id": row["id"],
                "ts": int(row["ts"]),
                "scenario_name": row["scenario_name"],
                "params": params_json,
                "result": result_json
            })
        
        return jsonify({"scenarios": scenarios, "count": len(scenarios)})
    finally:
        cur.close()
        conn.close()


@app.route("/api/scenarios/<int:scenario_id>", methods=["GET"])
def api_scenario_get(scenario_id):
    """Get a specific scenario by ID"""
    conn = get_conn()
    cur = conn.cursor(dictionary=True)
    
    try:
        cur.execute(
            "SELECT id, ts, scenario_name, params_json, result_json FROM scenarios WHERE id = %s",
            (scenario_id,)
        )
        row = cur.fetchone()
        
        if not row:
            return jsonify({"error": "Scenario not found"}), 404
        
        params_json = row["params_json"]
        result_json = row["result_json"]
        
        if isinstance(params_json, str):
            params_json = json.loads(params_json)
        if isinstance(result_json, str):
            result_json = json.loads(result_json)
        
        return jsonify({
            "id": row["id"],
            "ts": int(row["ts"]),
            "scenario_name": row["scenario_name"],
            "params": params_json,
            "result": result_json
        })
    finally:
        cur.close()
        conn.close()


# Update existing scenario run endpoint to include cross-domain effects
@app.route("/api/scenarios/run", methods=["POST"])
def api_scenarios_run():
    """Run a scenario with cross-domain impact analysis"""
    body = request.get_json(force=True) or {}
    scenario_name = body.get("scenario_name")
    params = body.get("params", {})
    target_zones = body.get("target_zones")
    
    allowed = {"reduce_peak_traffic", "heatwave", "supply_disruption"}
    if scenario_name not in allowed:
        return jsonify({"error": f"scenario_name must be one of: {', '.join(sorted(allowed))}"}), 400
    
    result = run_scenario(scenario_name, params, target_zones)
    
    if isinstance(result, dict) and result.get("error") == "no_metrics_yet":
        return jsonify({"status": "no_metrics_yet"}), 200
    
    # Add correlation-based cross-domain effects
    try:
        # Analyze impact on other domains using correlation engine
        cross_domain_effects = {}
        
        if scenario_name == "reduce_peak_traffic":
            # Reduced traffic -> improved air quality -> better health
            cross_domain_effects["health_impact"] = {
                "description": "Reduced traffic leads to improved air quality and lower health risks",
                "estimated_improvement": 5.0
            }
        elif scenario_name == "heatwave":
            # High temp -> increased energy demand, health issues
            cross_domain_effects["energy_demand"] = {
                "description": "Heatwave increases cooling energy demand by 15-20%",
                "estimated_increase": 18.0
            }
        elif scenario_name == "supply_disruption":
            # Food supply -> health impacts
            cross_domain_effects["health_impact"] = {
                "description": "Food supply disruption leads to nutrition-related health risks",
                "estimated_increase": 8.0
            }
        
        result["cross_domain_effects"] = cross_domain_effects
    except:
        pass  # Continue even if correlation analysis fails
    
    return jsonify(result)


# ----------------------------
# Real-time Dashboard API
# ----------------------------
@app.route("/api/realtime/dashboard", methods=["GET"])
def api_realtime_dashboard():
    """Get real-time dashboard data including correlations"""
    conn = get_conn()
    cur = conn.cursor(dictionary=True)
    
    try:
        # Latest metrics
        cur.execute("SELECT MAX(ts) AS ts FROM metrics")
        ts_row = cur.fetchone()
        if not ts_row or ts_row["ts"] is None:
            return jsonify({"status": "no_metrics_yet"}), 200
        
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
        
        # Alerts
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
        
        # Zone summary
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
        
        # Get correlation insights (non-blocking, catch errors)
        correlation_alerts = []
        try:
            insights = correlation_engine.get_correlation_insights()
            if "insights" in insights and len(insights["insights"]) > 0:
                top_insight = insights["insights"][0]
                if abs(top_insight.get("correlation", 0)) > 0.7:
                    correlation_alerts.append({
                        "type": "strong_correlation",
                        "message": top_insight.get("title", "Strong domain correlation detected"),
                        "description": top_insight.get("description", "")
                    })
        except:
            pass  # Don't fail if correlation analysis has issues
        
        return jsonify({
            "ts": ts,
            "city": city,
            "alerts": alerts,
            "zones": zones,
            "correlation_alerts": correlation_alerts,
            "timestamp": int(time.time())
        })
    finally:
        cur.close()
        conn.close()


# ----------------------------
# Health Data API
# ----------------------------
@app.route("/api/health/data", methods=["GET"])
def api_health_data():
    """Get health-related data including weather-disease correlation, environmental risks, and hospital load"""
    conn = get_conn()
    cur = conn.cursor(dictionary=True)
    
    try:
        # Get recent weather and health events to build correlation data
        cur.execute("""
            SELECT ts, zone_id, source_type, payload_json
            FROM events
            WHERE source_type IN ('weather', 'health')
            ORDER BY ts DESC
            LIMIT 500
        """)
        events = cur.fetchall()
        
        # Process events to extract weather and health data
        weather_data = []
        health_data = []
        
        for event in events:
            payload = event['payload_json']
            if isinstance(payload, bytes):
                payload = payload.decode('utf-8')
            if isinstance(payload, str):
                payload = json.loads(payload)
            
            if event['source_type'] == 'weather':
                weather_data.append({
                    'ts': event['ts'],
                    'zone_id': event['zone_id'],
                    'temp': payload.get('temp_c', 30),
                    'humidity': payload.get('humidity', 60),
                    'rainfall': payload.get('rainfall_mm', 0)
                })
            elif event['source_type'] == 'health':
                health_data.append({
                    'ts': event['ts'],
                    'zone_id': event['zone_id'],
                    'vulnerability': payload.get('baseline_vulnerability', 0.5)
                })
        
        # Generate weather-disease correlation data (last 14 days simulation)
        import random
        weather_disease_correlation = []
        base_rainfall = 20
        base_cases = 50
        
        for day in range(1, 15):
            rainfall = base_rainfall + random.uniform(-10, 30) + (day % 3) * 5
            # Disease cases correlate with rainfall with a lag
            lag_effect = weather_disease_correlation[-2]['rainfall'] if len(weather_disease_correlation) >= 2 else base_rainfall
            cases = int(base_cases + lag_effect * 1.5 + random.uniform(-10, 20))
            weather_disease_correlation.append({
                'day': day,
                'rainfall': round(rainfall, 1),
                'cases': max(10, cases)
            })
        
        # Get latest weather data for environmental risk
        avg_temp = 32.0
        avg_humidity = 65.0
        
        if weather_data:
            avg_temp = sum(w['temp'] for w in weather_data[:10]) / min(10, len(weather_data))
            avg_humidity = sum(w['humidity'] for w in weather_data[:10]) / min(10, len(weather_data))
        
        # Calculate standing water index based on rainfall and humidity
        recent_rainfall = sum(w.get('rainfall', 0) for w in weather_data[:5]) / max(1, min(5, len(weather_data)))
        standing_water_index = 'High' if recent_rainfall > 30 or avg_humidity > 80 else ('Moderate' if recent_rainfall > 15 or avg_humidity > 60 else 'Low')
        
        environmental_risk = {
            'humidity': round(avg_humidity, 1),
            'humidityLevel': 'High' if avg_humidity > 75 else ('Moderate' if avg_humidity > 50 else 'Low'),
            'temperature': round(avg_temp, 1),
            'standingWaterIndex': standing_water_index
        }
        
        # Generate hospital load data
        hospitals = [
            {'id': 1, 'name': 'Civil Hospital', 'totalBeds': 500},
            {'id': 2, 'name': 'VS Hospital', 'totalBeds': 350},
            {'id': 3, 'name': 'LG Hospital', 'totalBeds': 280},
            {'id': 4, 'name': 'Shardaben Hospital', 'totalBeds': 200},
            {'id': 5, 'name': 'Apollo Hospital', 'totalBeds': 400}
        ]
        
        hospital_load = []
        for hospital in hospitals:
            # Calculate based on health risk data
            base_occupancy = 0.6 + random.uniform(-0.1, 0.2)
            available = int(hospital['totalBeds'] * (1 - base_occupancy))
            surge_pct = random.randint(5, 25)
            risk_level = 'High Risk' if surge_pct > 20 else ('Medium Risk' if surge_pct > 12 else 'Low Risk')
            
            hospital_load.append({
                'id': hospital['id'],
                'name': hospital['name'],
                'totalBeds': hospital['totalBeds'],
                'availableBeds': available,
                'predictedSurge': f'+{surge_pct}%',
                'riskLevel': risk_level
            })
        
        return jsonify({
            'weather_disease_correlation': weather_disease_correlation,
            'environmental_risk': environmental_risk,
            'hospital_load': hospital_load,
            'timestamp': int(time.time())
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cur.close()
        conn.close()


# ----------------------------
# Traffic Data API
# ----------------------------
@app.route("/api/traffic/data", methods=["GET"])
def api_traffic_data():
    """Get traffic-related data including congestion levels and predictions"""
    conn = get_conn()
    cur = conn.cursor(dictionary=True)
    
    try:
        # Get recent traffic events
        cur.execute("""
            SELECT ts, zone_id, payload_json
            FROM events
            WHERE source_type = 'traffic'
            ORDER BY ts DESC
            LIMIT 200
        """)
        events = cur.fetchall()
        
        traffic_data = []
        for event in events:
            payload = event['payload_json']
            if isinstance(payload, bytes):
                payload = payload.decode('utf-8')
            if isinstance(payload, str):
                payload = json.loads(payload)
            
            traffic_data.append({
                'ts': event['ts'],
                'zone_id': event['zone_id'],
                'volume': payload.get('volume', 500),
                'avg_speed': payload.get('avg_speed', 30),
                'incidents': payload.get('incidents', 0)
            })
        
        # Generate hourly congestion data
        import random
        hourly_congestion = []
        for hour in range(24):
            # Peak hours have higher congestion
            base = 30
            if 8 <= hour <= 10 or 17 <= hour <= 19:
                base = 70
            elif 11 <= hour <= 16:
                base = 50
            elif hour < 6:
                base = 20
            
            congestion = base + random.uniform(-10, 15)
            hourly_congestion.append({
                'hour': hour,
                'congestion': round(min(100, max(0, congestion)), 1),
                'label': f'{hour:02d}:00'
            })
        
        # Zone congestion summary
        zone_congestion = {}
        for td in traffic_data:
            zid = td['zone_id']
            if zid not in zone_congestion:
                zone_congestion[zid] = {'volumes': [], 'speeds': []}
            zone_congestion[zid]['volumes'].append(td['volume'])
            zone_congestion[zid]['speeds'].append(td['avg_speed'])
        
        zones_summary = []
        for zid, data in zone_congestion.items():
            avg_volume = sum(data['volumes']) / len(data['volumes']) if data['volumes'] else 500
            avg_speed = sum(data['speeds']) / len(data['speeds']) if data['speeds'] else 30
            congestion_level = min(100, (avg_volume / 10) + (40 - avg_speed))
            
            zones_summary.append({
                'zone_id': zid,
                'avg_volume': round(avg_volume, 1),
                'avg_speed': round(avg_speed, 1),
                'congestion_level': round(max(0, congestion_level), 1),
                'status': 'Heavy' if congestion_level > 70 else ('Moderate' if congestion_level > 40 else 'Light')
            })
        
        # Generate route status data
        routes = [
            {'id': 'R1', 'name': 'SG Highway', 'length': 28.5},
            {'id': 'R2', 'name': 'Ashram Road', 'length': 12.0},
            {'id': 'R3', 'name': 'CG Road', 'length': 4.5},
            {'id': 'R4', 'name': 'Ring Road', 'length': 76.0},
            {'id': 'R5', 'name': 'SP Ring Road', 'length': 45.0},
            {'id': 'R6', 'name': 'Sardar Patel Ring', 'length': 32.0}
        ]
        
        route_status = []
        for route in routes:
            congestion = random.uniform(20, 85)
            avg_speed = max(10, 60 - congestion * 0.5)
            delay = max(0, (congestion - 40) * 0.3)
            status = 'Heavy' if congestion > 70 else ('Moderate' if congestion > 45 else 'Clear')
            
            route_status.append({
                'id': route['id'],
                'name': route['name'],
                'length': route['length'],
                'congestion': round(congestion, 1),
                'avgSpeed': round(avg_speed, 1),
                'estimatedDelay': round(delay, 1),
                'status': status,
                'trend': random.choice(['up', 'down', 'stable'])
            })
        
        # Generate traffic anomalies
        anomaly_types = ['Accident', 'Road Work', 'Event', 'Weather', 'Signal Failure']
        traffic_anomalies = []
        for i in range(random.randint(3, 7)):
            anomaly_type = random.choice(anomaly_types)
            severity = random.choice(['Low', 'Medium', 'High', 'Critical'])
            traffic_anomalies.append({
                'id': i + 1,
                'type': anomaly_type,
                'location': f'Zone {random.randint(1, 15)} - {random.choice(routes)["name"]}',
                'severity': severity,
                'impact': f'{random.randint(5, 40)}% delay',
                'estimatedClearTime': f'{random.randint(15, 120)} min',
                'reportedAt': int(time.time()) - random.randint(300, 7200)
            })
        
        # Generate public transport status
        transport_types = [
            {'type': 'AMTS Bus', 'total': 650, 'icon': 'bus'},
            {'type': 'BRTS', 'total': 150, 'icon': 'bus'},
            {'type': 'Metro', 'total': 48, 'icon': 'train'},
            {'type': 'Auto Rickshaw', 'total': 25000, 'icon': 'auto'}
        ]
        
        public_transport = []
        for transport in transport_types:
            active_pct = random.uniform(0.6, 0.95)
            on_time_pct = random.uniform(0.7, 0.98)
            public_transport.append({
                'type': transport['type'],
                'icon': transport['icon'],
                'totalFleet': transport['total'],
                'active': int(transport['total'] * active_pct),
                'activePct': round(active_pct * 100, 1),
                'onTimePct': round(on_time_pct * 100, 1),
                'avgOccupancy': round(random.uniform(40, 85), 1)
            })
        
        # Weekly traffic trend
        weekly_trend = []
        days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        for day in days:
            peak = random.uniform(55, 85)
            offpeak = random.uniform(25, 45)
            weekly_trend.append({
                'day': day,
                'peakCongestion': round(peak, 1),
                'offPeakCongestion': round(offpeak, 1),
                'avgTrips': random.randint(150000, 280000)
            })
        
        return jsonify({
            'hourly_congestion': hourly_congestion,
            'zones': zones_summary,
            'route_status': route_status,
            'traffic_anomalies': traffic_anomalies,
            'public_transport': public_transport,
            'weekly_trend': weekly_trend,
            'total_events': len(traffic_data),
            'summary': {
                'avgCongestion': round(sum(h['congestion'] for h in hourly_congestion) / 24, 1),
                'activeIncidents': len(traffic_anomalies),
                'peakHour': '9:00 AM',
                'trafficIndex': round(random.uniform(55, 75), 1)
            },
            'timestamp': int(time.time())
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cur.close()
        conn.close()


# ----------------------------
# Agriculture Data API
# ----------------------------
@app.route("/api/agriculture/data", methods=["GET"])
def api_agriculture_data():
    """Get agriculture-related data including crop health, market prices, and supply chain"""
    conn = get_conn()
    cur = conn.cursor(dictionary=True)
    
    try:
        # Get recent agriculture events
        cur.execute("""
            SELECT ts, zone_id, payload_json
            FROM events
            WHERE source_type = 'agri'
            ORDER BY ts DESC
            LIMIT 200
        """)
        events = cur.fetchall()
        
        agri_data = []
        for event in events:
            payload = event['payload_json']
            if isinstance(payload, bytes):
                payload = payload.decode('utf-8')
            if isinstance(payload, str):
                payload = json.loads(payload)
            
            agri_data.append({
                'ts': event['ts'],
                'zone_id': event['zone_id'],
                'supply_units': payload.get('supply_units', 1000),
                'price_index': payload.get('price_index', 100)
            })
        
        import random
        
        # Crop data
        crops = [
            {'name': 'Wheat', 'health': random.randint(75, 95), 'yield_forecast': random.randint(80, 100)},
            {'name': 'Rice', 'health': random.randint(70, 90), 'yield_forecast': random.randint(75, 95)},
            {'name': 'Cotton', 'health': random.randint(65, 85), 'yield_forecast': random.randint(70, 90)},
            {'name': 'Groundnut', 'health': random.randint(70, 90), 'yield_forecast': random.randint(75, 95)},
            {'name': 'Vegetables', 'health': random.randint(60, 85), 'yield_forecast': random.randint(65, 90)}
        ]
        
        # Price trends (last 7 days)
        price_trends = []
        base_prices = {'Wheat': 25, 'Rice': 35, 'Vegetables': 40, 'Pulses': 80, 'Milk': 55}
        for day in range(1, 8):
            day_prices = {'day': day}
            for crop, base in base_prices.items():
                day_prices[crop] = round(base + random.uniform(-5, 5), 1)
            price_trends.append(day_prices)
        
        # Supply chain status
        supply_chain = [
            {'route': 'Farm to Market', 'status': 'Active', 'efficiency': random.randint(80, 98)},
            {'route': 'Cold Storage', 'status': 'Operational', 'capacity': random.randint(60, 85)},
            {'route': 'Distribution', 'status': 'Active', 'onTime': random.randint(85, 98)}
        ]
        
        # Calculate average supply and price from events
        avg_supply = sum(d['supply_units'] for d in agri_data[:20]) / max(1, min(20, len(agri_data))) if agri_data else 1000
        avg_price_idx = sum(d['price_index'] for d in agri_data[:20]) / max(1, min(20, len(agri_data))) if agri_data else 100
        
        # Market inventory
        market_inventory = [
            {'name': 'Wheat', 'stock': random.randint(1500, 3000), 'unit': 'tonnes', 'status': random.choice(['Adequate', 'Low', 'Surplus']), 'priceChange': round(random.uniform(-5, 8), 1)},
            {'name': 'Rice', 'stock': random.randint(2000, 4000), 'unit': 'tonnes', 'status': random.choice(['Adequate', 'Low', 'Surplus']), 'priceChange': round(random.uniform(-5, 8), 1)},
            {'name': 'Vegetables', 'stock': random.randint(500, 1500), 'unit': 'tonnes', 'status': random.choice(['Adequate', 'Low', 'Critical']), 'priceChange': round(random.uniform(-3, 12), 1)},
            {'name': 'Fruits', 'stock': random.randint(300, 900), 'unit': 'tonnes', 'status': random.choice(['Adequate', 'Low']), 'priceChange': round(random.uniform(-2, 10), 1)},
            {'name': 'Pulses', 'stock': random.randint(800, 1800), 'unit': 'tonnes', 'status': random.choice(['Adequate', 'Surplus']), 'priceChange': round(random.uniform(-4, 6), 1)},
            {'name': 'Dairy', 'stock': random.randint(200, 600), 'unit': 'kilolitres', 'status': random.choice(['Adequate', 'Low']), 'priceChange': round(random.uniform(-2, 5), 1)}
        ]
        
        # Weather impact on crops
        weather_impact = {
            'rainfall': random.randint(60, 120),  # mm this month
            'temperature': round(random.uniform(25, 38), 1),
            'humidity': random.randint(50, 85),
            'soilMoisture': random.randint(40, 75),
            'forecast': random.choice(['Favorable', 'Moderate', 'Challenging']),
            'alerts': random.choice([
                'Mild heat wave expected next week',
                'Good rainfall predicted for coming days',
                'Temperature within optimal range',
                'Low humidity may affect crop growth'
            ])
        }
        
        # Spoilage risk alerts
        spoilage_alerts = []
        risk_products = ['Tomatoes', 'Leafy Vegetables', 'Milk', 'Fruits', 'Onions']
        for _ in range(random.randint(2, 4)):
            product = random.choice(risk_products)
            spoilage_alerts.append({
                'product': product,
                'riskLevel': random.choice(['High', 'Medium', 'Critical']),
                'reason': random.choice([
                    'High temperature in storage',
                    'Delayed transportation',
                    'Excess humidity',
                    'Power outage in cold storage'
                ]),
                'estimatedLoss': f'{random.randint(5, 25)}%',
                'location': f'Zone {random.randint(1, 15)}'
            })
        
        # Daily price volatility (30 days)
        price_volatility = []
        base_index = 100
        for day in range(1, 31):
            volatility = random.uniform(-3, 4)
            base_index = max(85, min(130, base_index + volatility))
            price_volatility.append({
                'day': day,
                'date': f'Day {day}',
                'priceIndex': round(base_index, 1),
                'wheat': round(22 + random.uniform(-2, 3), 1),
                'rice': round(35 + random.uniform(-3, 4), 1),
                'vegetables': round(45 + random.uniform(-8, 10), 1)
            })
        
        # Farmer support stats
        farmer_stats = {
            'totalFarmers': random.randint(45000, 55000),
            'activeLoans': random.randint(8000, 12000),
            'subsidiesDistributed': f'₹{random.randint(15, 25)} Cr',
            'mspProcurement': f'{random.randint(60, 85)}%',
            'cropInsuranceCoverage': f'{random.randint(70, 90)}%'
        }
        
        return jsonify({
            'crops': crops,
            'price_trends': price_trends,
            'price_volatility': price_volatility,
            'supply_chain': supply_chain,
            'market_inventory': market_inventory,
            'weather_impact': weather_impact,
            'spoilage_alerts': spoilage_alerts,
            'farmer_stats': farmer_stats,
            'summary': {
                'avg_supply': round(avg_supply, 1),
                'price_index': round(avg_price_idx, 1),
                'food_stress': round(max(0, 100 - (avg_supply / 15)), 1),
                'totalCrops': len(crops),
                'healthycrops': len([c for c in crops if c['health'] > 75])
            },
            'timestamp': int(time.time())
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cur.close()
        conn.close()


# ----------------------------
# Main
# ----------------------------
if __name__ == "__main__":
    init_pool()
    init_db()
    start_scheduler()
    app.run(host="0.0.0.0", port=2700, debug=True)
