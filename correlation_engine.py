"""
Correlation Engine - Cross-Domain Pattern Recognition & Analysis
Identifies how different domains (traffic, weather, health, agriculture) affect each other
"""
import json
import time
import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Optional
from storage import get_conn
from scipy import stats
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA


class CorrelationEngine:
    """Analyzes cross-domain correlations and causal relationships"""
    
    def __init__(self):
        self.domain_mappings = {
            'traffic': ['volume', 'avg_speed', 'congestion_index'],
            'weather': ['temp_c', 'humidity', 'rainfall_mm', 'heat_risk'],
            'health': ['baseline_vulnerability', 'health_risk', 'disease_cases'],
            'agriculture': ['supply_units', 'price_index', 'food_stress', 'crop_yield']
        }
        
    def extract_metrics_from_events(self, window_minutes: int = 120) -> pd.DataFrame:
        """Extract metrics from events table for correlation analysis"""
        conn = get_conn()
        cur = conn.cursor(dictionary=True)
        
        try:
            now = int(time.time())
            start_ts = now - (window_minutes * 60)
            
            # Get all events in window
            cur.execute("""
                SELECT ts, zone_id, source_type, payload_json
                FROM events
                WHERE ts >= %s
                ORDER BY ts, zone_id
            """, (start_ts,))
            
            rows = cur.fetchall()
            
            # Process into time series
            data_points = []
            for row in rows:
                zone_id = row['zone_id']
                source_type = row['source_type']
                ts = int(row['ts'])
                payload = row['payload_json']
                
                if isinstance(payload, str):
                    payload = json.loads(payload)
                
                # Extract domain-specific metrics
                point = {'ts': ts, 'zone_id': zone_id}
                
                if source_type == 'traffic':
                    point['traffic_volume'] = float(payload.get('volume', 0))
                    point['traffic_speed'] = float(payload.get('avg_speed', 60))
                elif source_type == 'weather':
                    point['temp'] = float(payload.get('temp_c', 25))
                    point['humidity'] = float(payload.get('humidity', 50))
                    point['rainfall'] = float(payload.get('rainfall_mm', 0))
                elif source_type == 'health':
                    point['health_vuln'] = float(payload.get('baseline_vulnerability', 0.5))
                    point['health_cases'] = float(payload.get('disease_cases', 0))
                elif source_type == 'agri':
                    point['agri_supply'] = float(payload.get('supply_units', 1000))
                    point['agri_price'] = float(payload.get('price_index', 100))
                
                data_points.append(point)
            
            # Convert to DataFrame and aggregate by time
            if not data_points:
                return pd.DataFrame()
            
            df = pd.DataFrame(data_points)
            
            # Aggregate by zone and time (round to 5-minute intervals)
            df['ts_rounded'] = (df['ts'] // 300) * 300
            
            # Group by zone and time, take mean values
            grouped = df.groupby(['zone_id', 'ts_rounded']).agg({
                'traffic_volume': 'mean',
                'traffic_speed': 'mean',
                'temp': 'mean',
                'humidity': 'mean',
                'rainfall': 'sum',  # Sum rainfall over interval
                'health_vuln': 'mean',
                'health_cases': 'sum',  # Sum cases
                'agri_supply': 'mean',
                'agri_price': 'mean'
            }).reset_index()
            
            return grouped
            
        finally:
            cur.close()
            conn.close()
    
    def compute_correlation_matrix(self, zone_id: Optional[str] = None) -> Dict:
        """Compute correlation matrix between all domain metrics"""
        df = self.extract_metrics_from_events(window_minutes=720)  # 12 hours
        
        if df.empty or len(df) < 10:
            return {"error": "Insufficient data for correlation analysis"}
        
        if zone_id:
            df = df[df['zone_id'] == zone_id]
        
        # Select numeric columns for correlation
        numeric_cols = ['traffic_volume', 'traffic_speed', 'temp', 'humidity', 
                       'rainfall', 'health_vuln', 'health_cases', 'agri_supply', 'agri_price']
        
        # Filter to columns that exist and have data
        available_cols = [col for col in numeric_cols if col in df.columns and df[col].notna().sum() > 0]
        
        if len(available_cols) < 2:
            return {"error": "Insufficient data columns"}
        
        corr_df = df[available_cols].corr()
        
        # Convert to dict format
        matrix = {}
        for col1 in available_cols:
            matrix[col1] = {}
            for col2 in available_cols:
                corr_val = corr_df.loc[col1, col2]
                if pd.notna(corr_val):
                    matrix[col1][col2] = float(corr_val)
        
        return {
            "matrix": matrix,
            "domain_names": available_cols,
            "data_points": len(df),
            "zone_id": zone_id or "all"
        }
    
    def compute_time_lagged_correlations(self, source_domain: str, target_domain: str, 
                                        max_lag_hours: int = 24) -> Dict:
        """Compute correlations with time lags (e.g., rain today -> crop yield in 2 weeks)"""
        df = self.extract_metrics_from_events(window_minutes=2880)  # 48 hours
        
        if df.empty:
            return {"error": "Insufficient data"}
        
        # Map domain names to columns
        domain_cols = {
            'traffic': ['traffic_volume', 'traffic_speed'],
            'weather': ['temp', 'rainfall'],
            'health': ['health_vuln', 'health_cases'],
            'agriculture': ['agri_supply', 'agri_price']
        }
        
        source_cols = domain_cols.get(source_domain, [])
        target_cols = domain_cols.get(target_domain, [])
        
        if not source_cols or not target_cols:
            return {"error": "Invalid domain names"}
        
        # Use first available column from each domain
        source_col = None
        target_col = None
        for col in source_cols:
            if col in df.columns and df[col].notna().sum() > 5:
                source_col = col
                break
        for col in target_cols:
            if col in df.columns and df[col].notna().sum() > 5:
                target_col = col
                break
        
        if not source_col or not target_col:
            return {"error": "Insufficient data for specified domains"}
        
        # Sort by timestamp
        df = df.sort_values('ts_rounded')
        
        # Compute lagged correlations
        lags = list(range(0, max_lag_hours + 1))
        lag_correlations = []
        
        for lag in lags:
            lag_minutes = lag * 60
            lag_intervals = lag_minutes // 5  # 5-minute intervals
            
            # Shift target by lag
            df_shifted = df.copy()
            df_shifted[f'{target_col}_lagged'] = df_shifted[target_col].shift(lag_intervals)
            
            # Compute correlation
            valid_data = df_shifted[[source_col, f'{target_col}_lagged']].dropna()
            if len(valid_data) > 5:
                corr, p_value = stats.pearsonr(valid_data[source_col], valid_data[f'{target_col}_lagged'])
                lag_correlations.append({
                    "lag_hours": lag,
                    "correlation": float(corr) if not np.isnan(corr) else 0.0,
                    "p_value": float(p_value) if not np.isnan(p_value) else 1.0,
                    "data_points": len(valid_data)
                })
        
        # Find best lag
        if lag_correlations:
            best_lag = max(lag_correlations, key=lambda x: abs(x['correlation']))
        else:
            best_lag = None
        
        return {
            "source_domain": source_domain,
            "target_domain": target_domain,
            "source_metric": source_col,
            "target_metric": target_col,
            "lag_correlations": lag_correlations,
            "best_lag": best_lag,
            "interpretation": self._interpret_lag_correlation(best_lag, source_domain, target_domain) if best_lag else None
        }
    
    def _interpret_lag_correlation(self, best_lag: Dict, source: str, target: str) -> str:
        """Generate human-readable interpretation of lag correlation"""
        if not best_lag:
            return "No significant correlation found"
        
        corr = best_lag['correlation']
        lag = best_lag['lag_hours']
        
        strength = "strong" if abs(corr) > 0.7 else "moderate" if abs(corr) > 0.4 else "weak"
        direction = "positive" if corr > 0 else "negative"
        
        lag_desc = f"{lag} hour(s)" if lag > 0 else "immediate"
        
        return f"{strength.capitalize()} {direction} correlation (r={corr:.2f}) with {lag_desc} lag: {source} changes affect {target}"
    
    def compute_granger_causality(self, source_domain: str, target_domain: str) -> Dict:
        """Simple Granger causality test using correlation and lag analysis"""
        lag_result = self.compute_time_lagged_correlations(source_domain, target_domain, max_lag_hours=12)
        
        if "error" in lag_result:
            return lag_result
        
        best_lag = lag_result.get("best_lag")
        if not best_lag:
            return {"error": "No significant lag correlation found"}
        
        # If lag correlation is significant, suggest causality
        p_value = best_lag.get("p_value", 1.0)
        corr = abs(best_lag.get("correlation", 0))
        
        is_significant = p_value < 0.05 and corr > 0.3
        
        return {
            "source_domain": source_domain,
            "target_domain": target_domain,
            "suggests_causality": is_significant,
            "correlation": best_lag["correlation"],
            "p_value": p_value,
            "lag_hours": best_lag["lag_hours"],
            "confidence": "high" if p_value < 0.01 and corr > 0.5 else "medium" if p_value < 0.05 else "low"
        }
    
    def detect_anomalies(self, zone_id: Optional[str] = None) -> List[Dict]:
        """Detect when normal correlations break (anomalies)"""
        df = self.extract_metrics_from_events(window_minutes=1440)  # 24 hours
        
        if df.empty:
            return []
        
        if zone_id:
            df = df[df['zone_id'] == zone_id]
        
        anomalies = []
        
        # Example: Check if rainfall increases but traffic doesn't slow down (good drainage)
        if 'rainfall' in df.columns and 'traffic_speed' in df.columns:
            recent = df.tail(20)
            avg_rain = recent['rainfall'].mean()
            avg_speed = recent['traffic_speed'].mean()
            
            # Historical baseline (earlier in window)
            historical = df.head(len(df) - 20) if len(df) > 20 else df
            baseline_rain = historical['rainfall'].mean() if len(historical) > 0 else 0
            baseline_speed = historical['traffic_speed'].mean() if len(historical) > 0 else 60
            
            # Anomaly: Heavy rain but speed maintained
            if avg_rain > baseline_rain * 2 and avg_speed >= baseline_speed * 0.9:
                anomalies.append({
                    "type": "positive_anomaly",
                    "description": f"Rainfall increased by {((avg_rain/baseline_rain - 1) * 100):.0f}% but traffic speed maintained",
                    "interpretation": "Good drainage infrastructure or low traffic volume",
                    "zone_id": zone_id or "all"
                })
        
        # Example: High traffic but air quality good (electric vehicles?)
        # This would require air quality data which we may not have
        
        return anomalies
    
    def quantify_impact(self, source_domain: str, target_domain: str, 
                       source_change: float) -> Dict:
        """Quantify how much one factor affects another (e.g., 10mm rain = 15% traffic increase)"""
        lag_result = self.compute_time_lagged_correlations(source_domain, target_domain)
        
        if "error" in lag_result:
            return lag_result
        
        best_lag = lag_result.get("best_lag")
        if not best_lag:
            return {"error": "Insufficient correlation to quantify impact"}
        
        corr = best_lag.get("correlation", 0)
        
        # Simplified impact calculation (in production, use regression)
        impact_magnitude = abs(corr) * source_change * 0.1  # Simplified multiplier
        
        return {
            "source_domain": source_domain,
            "target_domain": target_domain,
            "source_change": source_change,
            "estimated_target_change": impact_magnitude,
            "impact_percentage": (impact_magnitude / abs(source_change) * 100) if source_change != 0 else 0,
            "correlation_used": corr,
            "interpretation": f"A {source_change} unit change in {source_domain} may lead to approximately {impact_magnitude:.2f} unit change in {target_domain} (correlation: {corr:.2f})"
        }
    
    def get_correlation_insights(self, zone_id: Optional[str] = None) -> Dict:
        """Get key insights about domain interactions for a zone or all zones"""
        matrix_result = self.compute_correlation_matrix(zone_id)
        
        if "error" in matrix_result:
            return matrix_result
        
        matrix = matrix_result.get("matrix", {})
        
        insights = []
        
        # Find strongest correlations
        strong_correlations = []
        for col1 in matrix:
            for col2 in matrix:
                if col1 < col2:  # Avoid duplicates
                    corr = matrix[col1].get(col2, 0)
                    if abs(corr) > 0.5:
                        strong_correlations.append({
                            "source": col1,
                            "target": col2,
                            "correlation": corr,
                            "strength": "strong" if abs(corr) > 0.7 else "moderate"
                        })
        
        strong_correlations.sort(key=lambda x: abs(x["correlation"]), reverse=True)
        
        # Generate insights
        for corr_info in strong_correlations[:5]:  # Top 5
            source = corr_info["source"]
            target = corr_info["target"]
            corr_val = corr_info["correlation"]
            
            direction = "increases with" if corr_val > 0 else "decreases with"
            
            insights.append({
                "title": f"{source.replace('_', ' ').title()} {direction} {target.replace('_', ' ').title()}",
                "correlation": corr_val,
                "strength": corr_info["strength"],
                "description": self._generate_insight_description(source, target, corr_val)
            })
        
        # Check for anomalies
        anomalies = self.detect_anomalies(zone_id)
        
        return {
            "zone_id": zone_id or "all",
            "insights": insights,
            "anomalies": anomalies,
            "summary": f"Found {len(insights)} significant correlations and {len(anomalies)} anomalies"
        }
    
    def _generate_insight_description(self, source: str, target: str, corr: float) -> str:
        """Generate human-readable description of correlation"""
        descriptions = {
            ("rainfall", "traffic_speed"): f"Heavy rainfall ({abs(corr)*100:.0f}% correlation) significantly impacts traffic speed",
            ("traffic_volume", "health_cases"): f"High traffic volume correlates ({abs(corr)*100:.0f}%) with health issues, likely due to air pollution",
            ("temp", "health_vuln"): f"Temperature extremes ({abs(corr)*100:.0f}% correlation) affect population vulnerability",
            ("rainfall", "agri_supply"): f"Rainfall patterns ({abs(corr)*100:.0f}% correlation) directly impact agricultural supply",
            ("agri_price", "health_cases"): f"Food price fluctuations ({abs(corr)*100:.0f}% correlation) correlate with health outcomes"
        }
        
        key = (source, target)
        reverse_key = (target, source)
        
        if key in descriptions:
            return descriptions[key]
        elif reverse_key in descriptions:
            return descriptions[reverse_key]
        else:
            return f"Moderate correlation ({corr:.2f}) detected between {source.replace('_', ' ')} and {target.replace('_', ' ')}"


# Global instance
correlation_engine = CorrelationEngine()
