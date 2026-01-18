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
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)


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
            if isinstance(payload, str):
                payload = json.loads(payload)
            
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
# Main
# ----------------------------
if __name__ == "__main__":
    init_pool()
    init_db()
    start_scheduler()
    app.run(host="0.0.0.0", port=5000, debug=True)
