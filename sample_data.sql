-- Sample Data for Smart City Platform
-- This file contains sample events and metrics with clear correlations
-- Run this AFTER setting up the database schema

USE smartcity;

-- Clear existing data (optional - comment out if you want to keep existing data)
-- DELETE FROM scenarios;
-- DELETE FROM metrics;
-- DELETE FROM events;

-- Set base timestamp (current time - 2 hours)
SET @base_ts = UNIX_TIMESTAMP(NOW()) - 7200;

-- ============================================
-- SAMPLE EVENTS WITH CORRELATIONS
-- ============================================

-- Zone A: Rainy day scenario (weather -> traffic -> health correlation)
-- Heavy rain at 10am causes traffic slowdown and health issues

-- Weather events (rain)
INSERT INTO events (ts, zone_id, source_type, payload_json) VALUES
(@base_ts + 36000, 'Z01', 'weather', '{"temp_c": 22, "humidity": 85, "rainfall_mm": 25}'),
(@base_ts + 36060, 'Z01', 'weather', '{"temp_c": 22, "humidity": 88, "rainfall_mm": 30}'),
(@base_ts + 36120, 'Z01', 'weather', '{"temp_c": 21, "humidity": 90, "rainfall_mm": 15}');

-- Traffic events (slowed due to rain - correlation!)
INSERT INTO events (ts, zone_id, source_type, payload_json) VALUES
(@base_ts + 36030, 'Z01', 'traffic', '{"volume": 950, "avg_speed": 35}'),
(@base_ts + 36090, 'Z01', 'traffic', '{"volume": 1100, "avg_speed": 28}'),
(@base_ts + 36150, 'Z01', 'traffic', '{"volume": 1050, "avg_speed": 32}');

-- Health events (increased cases after traffic/weather issues)
INSERT INTO events (ts, zone_id, source_type, payload_json) VALUES
(@base_ts + 36200, 'Z01', 'health', '{"baseline_vulnerability": 0.55, "disease_cases": 15}'),
(@base_ts + 36300, 'Z01', 'health', '{"baseline_vulnerability": 0.58, "disease_cases": 18}');

-- Agriculture events (affected by weather)
INSERT INTO events (ts, zone_id, source_type, payload_json) VALUES
(@base_ts + 36100, 'Z01', 'agri', '{"supply_units": 1200, "price_index": 105}'),
(@base_ts + 36400, 'Z01', 'agri', '{"supply_units": 1100, "price_index": 112}');

-- Zone B: Traffic congestion -> Air quality -> Health correlation
-- High traffic causes pollution which affects health

INSERT INTO events (ts, zone_id, source_type, payload_json) VALUES
-- Traffic spike
(@base_ts + 38000, 'Z02', 'traffic', '{"volume": 1800, "avg_speed": 45}'),
(@base_ts + 38060, 'Z02', 'traffic', '{"volume": 1950, "avg_speed": 38}'),
(@base_ts + 38120, 'Z02', 'traffic', '{"volume": 1750, "avg_speed": 42}'),
-- Weather (no rain, normal)
(@base_ts + 38000, 'Z02', 'weather', '{"temp_c": 28, "humidity": 60, "rainfall_mm": 0}'),
-- Health (worsens after traffic pollution)
(@base_ts + 38200, 'Z02', 'health', '{"baseline_vulnerability": 0.52, "disease_cases": 12}'),
(@base_ts + 38400, 'Z02', 'health', '{"baseline_vulnerability": 0.56, "disease_cases": 16}'),
-- Agriculture (normal)
(@base_ts + 38000, 'Z02', 'agri', '{"supply_units": 1500, "price_index": 98}');

-- Zone C: Agriculture supply issue -> Food prices -> Health correlation

INSERT INTO events (ts, zone_id, source_type, payload_json) VALUES
-- Agriculture supply drops
(@base_ts + 40000, 'Z03', 'agri', '{"supply_units": 800, "price_index": 125}'),
(@base_ts + 40100, 'Z03', 'agri', '{"supply_units": 750, "price_index": 135}'),
-- Weather (normal)
(@base_ts + 40000, 'Z03', 'weather', '{"temp_c": 26, "humidity": 55, "rainfall_mm": 0}'),
-- Traffic (normal)
(@base_ts + 40000, 'Z03', 'traffic', '{"volume": 1200, "avg_speed": 55}'),
-- Health (worsens due to food issues)
(@base_ts + 40200, 'Z03', 'health', '{"baseline_vulnerability": 0.48, "disease_cases": 10}'),
(@base_ts + 40400, 'Z03', 'health', '{"baseline_vulnerability": 0.52, "disease_cases": 14}');

-- Zone D: Heatwave scenario (weather -> health -> traffic correlation)

INSERT INTO events (ts, zone_id, source_type, payload_json) VALUES
-- High temperature
(@base_ts + 42000, 'Z04', 'weather', '{"temp_c": 38, "humidity": 75, "rainfall_mm": 0}'),
(@base_ts + 42060, 'Z04', 'weather', '{"temp_c": 39, "humidity": 78, "rainfall_mm": 0}'),
(@base_ts + 42120, 'Z04', 'weather', '{"temp_c": 37, "humidity": 72, "rainfall_mm": 0}'),
-- Health (heat-related issues)
(@base_ts + 42200, 'Z04', 'health', '{"baseline_vulnerability": 0.62, "disease_cases": 22}'),
(@base_ts + 42400, 'Z04', 'health', '{"baseline_vulnerability": 0.65, "disease_cases": 25}'),
-- Traffic (reduced due to heat)
(@base_ts + 42100, 'Z04', 'traffic', '{"volume": 900, "avg_speed": 52}'),
-- Agriculture (affected by heat)
(@base_ts + 42000, 'Z04', 'agri', '{"supply_units": 1300, "price_index": 108}'),
(@base_ts + 42400, 'Z04', 'agri', '{"supply_units": 1250, "price_index": 115}');

-- Zone E: Normal baseline (for comparison)

INSERT INTO events (ts, zone_id, source_type, payload_json) VALUES
(@base_ts + 44000, 'Z05', 'weather', '{"temp_c": 26, "humidity": 58, "rainfall_mm": 2}'),
(@base_ts + 44000, 'Z05', 'traffic', '{"volume": 1400, "avg_speed": 58}'),
(@base_ts + 44000, 'Z05', 'health', '{"baseline_vulnerability": 0.40, "disease_cases": 5}'),
(@base_ts + 44000, 'Z05', 'agri', '{"supply_units": 1600, "price_index": 95}');

-- More recent events (last hour) for real-time display
SET @recent_ts = UNIX_TIMESTAMP(NOW()) - 3600;

INSERT INTO events (ts, zone_id, source_type, payload_json) VALUES
-- Recent weather
(@recent_ts + 0, 'Z01', 'weather', '{"temp_c": 24, "humidity": 70, "rainfall_mm": 5}'),
(@recent_ts + 60, 'Z02', 'weather', '{"temp_c": 29, "humidity": 58, "rainfall_mm": 0}'),
(@recent_ts + 120, 'Z03', 'weather', '{"temp_c": 27, "humidity": 62, "rainfall_mm": 1}'),
(@recent_ts + 180, 'Z04', 'weather', '{"temp_c": 32, "humidity": 68, "rainfall_mm": 0}'),
(@recent_ts + 240, 'Z05', 'weather', '{"temp_c": 25, "humidity": 55, "rainfall_mm": 3}'),
-- Recent traffic
(@recent_ts + 0, 'Z01', 'traffic', '{"volume": 1100, "avg_speed": 48}'),
(@recent_ts + 60, 'Z02', 'traffic', '{"volume": 1600, "avg_speed": 50}'),
(@recent_ts + 120, 'Z03', 'traffic', '{"volume": 1300, "avg_speed": 56}'),
(@recent_ts + 180, 'Z04', 'traffic', '{"volume": 1000, "avg_speed": 54}'),
(@recent_ts + 240, 'Z05', 'traffic', '{"volume": 1450, "avg_speed": 60}'),
-- Recent health
(@recent_ts + 300, 'Z01', 'health', '{"baseline_vulnerability": 0.50, "disease_cases": 8}'),
(@recent_ts + 360, 'Z02', 'health', '{"baseline_vulnerability": 0.48, "disease_cases": 7}'),
(@recent_ts + 420, 'Z03', 'health', '{"baseline_vulnerability": 0.45, "disease_cases": 6}'),
(@recent_ts + 480, 'Z04', 'health', '{"baseline_vulnerability": 0.55, "disease_cases": 12}'),
(@recent_ts + 540, 'Z05', 'health', '{"baseline_vulnerability": 0.38, "disease_cases": 4}'),
-- Recent agriculture
(@recent_ts + 300, 'Z01', 'agri', '{"supply_units": 1350, "price_index": 102}'),
(@recent_ts + 360, 'Z02', 'agri', '{"supply_units": 1550, "price_index": 96}'),
(@recent_ts + 420, 'Z03', 'agri', '{"supply_units": 1450, "price_index": 99}'),
(@recent_ts + 480, 'Z04', 'agri', '{"supply_units": 1400, "price_index": 104}'),
(@recent_ts + 540, 'Z05', 'agri', '{"supply_units": 1650, "price_index": 94}');

-- ============================================
-- SAMPLE METRICS (Processed KPIs)
-- ============================================

-- Generate metrics from recent events
SET @metrics_ts = UNIX_TIMESTAMP(NOW());

INSERT INTO metrics (ts, zone_id, metric_name, value, explanation) VALUES
-- Zone Z01 (with correlation insights)
(@metrics_ts, 'Z01', 'congestion_index', 62.5, 'Derived from volume=1100, speed=48 km/h. Correlation: Rain increased traffic delays'),
(@metrics_ts, 'Z01', 'heat_risk', 38.2, 'Derived from temp=24C, humidity=70%'),
(@metrics_ts, 'Z01', 'food_stress', 42.8, 'Derived from supply=1350, price_index=102'),
(@metrics_ts, 'Z01', 'health_risk', 52.3, 'Baseline vuln=0.50 + heat + congestion. Cross-domain impact: Weather->Traffic->Health'),
-- Zone Z02
(@metrics_ts, 'Z02', 'congestion_index', 68.3, 'Derived from volume=1600, speed=50 km/h'),
(@metrics_ts, 'Z02', 'heat_risk', 45.1, 'Derived from temp=29C, humidity=58%'),
(@metrics_ts, 'Z02', 'food_stress', 35.2, 'Derived from supply=1550, price_index=96'),
(@metrics_ts, 'Z02', 'health_risk', 48.7, 'Baseline vuln=0.48 + heat + congestion'),
-- Zone Z03
(@metrics_ts, 'Z03', 'congestion_index', 54.2, 'Derived from volume=1300, speed=56 km/h'),
(@metrics_ts, 'Z03', 'heat_risk', 42.5, 'Derived from temp=27C, humidity=62%'),
(@metrics_ts, 'Z03', 'food_stress', 38.9, 'Derived from supply=1450, price_index=99'),
(@metrics_ts, 'Z03', 'health_risk', 44.2, 'Baseline vuln=0.45 + heat + congestion'),
-- Zone Z04 (heatwave)
(@metrics_ts, 'Z04', 'congestion_index', 51.8, 'Derived from volume=1000, speed=54 km/h'),
(@metrics_ts, 'Z04', 'heat_risk', 72.3, 'Derived from temp=32C, humidity=68%. Correlation: High temp affects health'),
(@metrics_ts, 'Z04', 'food_stress', 41.5, 'Derived from supply=1400, price_index=104'),
(@metrics_ts, 'Z04', 'health_risk', 65.8, 'Baseline vuln=0.55 + heat + congestion. Cross-domain: Weather->Health'),
-- Zone Z05 (normal baseline)
(@metrics_ts, 'Z05', 'congestion_index', 48.5, 'Derived from volume=1450, speed=60 km/h'),
(@metrics_ts, 'Z05', 'heat_risk', 33.1, 'Derived from temp=25C, humidity=55%'),
(@metrics_ts, 'Z05', 'food_stress', 32.8, 'Derived from supply=1650, price_index=94'),
(@metrics_ts, 'Z05', 'health_risk', 38.2, 'Baseline vuln=0.38 + heat + congestion');

-- ============================================
-- SAMPLE SCENARIOS (with cross-domain effects)
-- ============================================

INSERT INTO scenarios (ts, scenario_name, params_json, result_json) VALUES
(@metrics_ts - 600, 'reduce_peak_traffic', 
 '{"traffic_reduction_pct": 20}', 
 '{"scenario_name": "reduce_peak_traffic", "params": {"traffic_reduction_pct": 20}, "baseline": {"Z01": {"congestion_index": 65, "heat_risk": 40, "food_stress": 45, "health_risk": 55}}, "scenario": {"Z01": {"congestion_index": 52, "heat_risk": 40, "food_stress": 45, "health_risk": 50.5}}, "cross_domain_effects": {"health_impact": {"description": "Reduced traffic leads to improved air quality and lower health risks", "estimated_improvement": 5.0}}, "timestamp": ' || (@metrics_ts - 600) || '}'),

(@metrics_ts - 300, 'heatwave', 
 '{"temp_increase_c": 5}', 
 '{"scenario_name": "heatwave", "params": {"temp_increase_c": 5}, "baseline": {"Z04": {"congestion_index": 50, "heat_risk": 60, "food_stress": 40, "health_risk": 58}}, "scenario": {"Z04": {"congestion_index": 50, "heat_risk": 100, "food_stress": 40, "health_risk": 78}}, "cross_domain_effects": {"energy_demand": {"description": "Heatwave increases cooling energy demand by 15-20%", "estimated_increase": 18.0}}, "timestamp": ' || (@metrics_ts - 300) || '}'),

(@metrics_ts - 120, 'supply_disruption', 
 '{"supply_drop_pct": 30}', 
 '{"scenario_name": "supply_disruption", "params": {"supply_drop_pct": 30}, "baseline": {"Z03": {"congestion_index": 54, "heat_risk": 42, "food_stress": 38, "health_risk": 44}}, "scenario": {"Z03": {"congestion_index": 54, "heat_risk": 42, "food_stress": 56.6, "health_risk": 48.5}}, "cross_domain_effects": {"health_impact": {"description": "Food supply disruption leads to nutrition-related health risks", "estimated_increase": 8.0}}, "timestamp": ' || (@metrics_ts - 120) || '}');

-- ============================================
-- SAMPLE USER (for testing authentication)
-- ============================================

-- Note: Password hash for "admin123" (in production, use the registration endpoint)
-- This is a sample - actual passwords should be hashed by the auth module
-- INSERT INTO users (username, email, password_hash, created_at, role) VALUES
-- ('admin', 'admin@smartcity.local', 'sample_hash_here', UNIX_TIMESTAMP(NOW()), 'admin'),
-- ('user', 'user@smartcity.local', 'sample_hash_here', UNIX_TIMESTAMP(NOW()), 'user');

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check inserted events
SELECT COUNT(*) AS total_events FROM events;
SELECT zone_id, source_type, COUNT(*) as count FROM events GROUP BY zone_id, source_type;

-- Check metrics
SELECT COUNT(*) AS total_metrics FROM metrics;
SELECT zone_id, metric_name, value FROM metrics WHERE ts = @metrics_ts ORDER BY zone_id, metric_name;

-- Check scenarios
SELECT COUNT(*) AS total_scenarios FROM scenarios;
SELECT scenario_name, ts FROM scenarios ORDER BY ts DESC;
