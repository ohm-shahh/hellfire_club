/**
 * Smart City Dashboard API Service
 * Handles all API calls to the Flask backend (port 5000)
 */

const API_BASE_URL = 'http://localhost:5000';

// Helper function to get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('auth_token');
};

// Helper function for API calls with authentication
const apiCall = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(error.error || `API Error: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    // Enhanced error logging for debugging
    console.error(`API call failed: ${API_BASE_URL}${endpoint}`, error);
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error(`Cannot connect to API server at ${API_BASE_URL}. Make sure the Flask backend is running.`);
    }
    throw error;
  }
};

// ====================
// Authentication APIs
// ====================
export const registerUser = async (username, email, password) => {
  return apiCall('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, email, password })
  });
};

export const loginUser = async (username, password) => {
  const result = await apiCall('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });
  
  if (result.token) {
    localStorage.setItem('auth_token', result.token);
    localStorage.setItem('user', JSON.stringify(result.user));
  }
  
  return result;
};

export const logoutUser = async () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user');
  return apiCall('/api/auth/logout', { method: 'POST' });
};

export const getCurrentUser = async () => {
  return apiCall('/api/auth/user');
};

// ====================
// Events APIs
// ====================
export const fetchEvents = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.zone_id) queryParams.append('zone_id', params.zone_id);
  if (params.source_type) queryParams.append('source_type', params.source_type);
  if (params.start_ts) queryParams.append('start_ts', params.start_ts);
  if (params.end_ts) queryParams.append('end_ts', params.end_ts);
  
  const query = queryParams.toString();
  return apiCall(`/api/events${query ? `?${query}` : ''}`);
};

export const createEvent = async (eventData) => {
  return apiCall('/api/events', {
    method: 'POST',
    body: JSON.stringify(eventData)
  });
};

// ====================
// Metrics APIs
// ====================
export const fetchMetrics = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.zone_id) queryParams.append('zone_id', params.zone_id);
  if (params.metric_name) queryParams.append('metric_name', params.metric_name);
  if (params.start_ts) queryParams.append('start_ts', params.start_ts);
  if (params.end_ts) queryParams.append('end_ts', params.end_ts);
  
  const query = queryParams.toString();
  return apiCall(`/api/metrics${query ? `?${query}` : ''}`);
};

export const fetchMetricsSummary = async () => {
  return apiCall('/api/metrics/summary');
};

export const fetchMetricsTimeSeries = async (zoneId, metric, limit = 60) => {
  return apiCall(`/api/metrics/timeseries?zone_id=${zoneId}&metric=${metric}&limit=${limit}`);
};

// ====================
// Dashboard APIs
// ====================
export const fetchRealtimeDashboard = async () => {
  console.log('Fetching realtime dashboard from:', `${API_BASE_URL}/api/realtime/dashboard`);
  try {
    const result = await apiCall('/api/realtime/dashboard');
    console.log('Realtime dashboard response:', result);
    return result;
  } catch (error) {
    console.error('fetchRealtimeDashboard error:', error);
    throw error;
  }
};

export const fetchKPIsCurrent = async () => {
  return apiCall('/api/kpis/current');
};

export const fetchZonesSummary = async () => {
  return apiCall('/api/zones/summary');
};

export const fetchZones = async () => {
  return apiCall('/api/zones');
};

// ====================
// Correlation APIs
// ====================
export const fetchCorrelationMatrix = async (zoneId = null) => {
  const query = zoneId ? `?zone_id=${zoneId}` : '';
  return apiCall(`/api/correlations/matrix${query}`);
};

export const fetchCorrelationInsights = async (zoneId = null) => {
  const query = zoneId ? `?zone_id=${zoneId}` : '';
  return apiCall(`/api/correlations/insights${query}`);
};

export const fetchCorrelationImpact = async (sourceDomain, targetDomain, sourceChange = null) => {
  const params = new URLSearchParams({
    source_domain: sourceDomain,
    target_domain: targetDomain
  });
  if (sourceChange !== null) {
    params.append('source_change', sourceChange);
  }
  return apiCall(`/api/correlations/impact?${params.toString()}`);
};

export const triggerCorrelationAnalysis = async (zoneId = null) => {
  return apiCall('/api/correlations/analyze', {
    method: 'POST',
    body: JSON.stringify({ zone_id: zoneId })
  });
};

// ====================
// Scenarios APIs
// ====================
export const fetchScenarios = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.scenario_name) queryParams.append('scenario_name', params.scenario_name);
  if (params.limit) queryParams.append('limit', params.limit);
  
  const query = queryParams.toString();
  return apiCall(`/api/scenarios${query ? `?${query}` : ''}`);
};

export const fetchScenario = async (scenarioId) => {
  return apiCall(`/api/scenarios/${scenarioId}`);
};

export const runScenario = async (scenarioName, params = {}, targetZones = null) => {
  return apiCall('/api/scenarios/run', {
    method: 'POST',
    body: JSON.stringify({
      scenario_name: scenarioName,
      params,
      target_zones: targetZones
    })
  });
};

// ====================
// Legacy compatibility (for existing components)
// ====================
export const fetchDashboardData = async () => {
  // Map to realtime dashboard
  const data = await fetchRealtimeDashboard();
  
  // Handle "no_metrics_yet" case
  if (data.status === "no_metrics_yet") {
    return {
      city_name: 'Smart City',
      overview_stats: {
        traffic: { level: 'No Data', percentage: 0 },
        dengueRisk: { level: 'No Data', color: 'gray' },
        foodPrice: { status: 'No Data', change: '0%', color: 'gray' },
        weather: { alert: 'No Data', color: 'gray' }
      },
      critical_alerts: [],
      system_health: {
        dataPipeline: { status: 'Waiting for data', color: 'yellow' }
      },
      correlation_alerts: []
    };
  }
  
  // Transform to expected format for existing components
  return {
    city_name: 'Smart City',
    overview_stats: {
      traffic: {
        level: data.city?.congestion_index > 70 ? 'High' : data.city?.congestion_index > 40 ? 'Moderate' : 'Low',
        percentage: Math.round(data.city?.congestion_index || 0)
      },
      dengueRisk: {
        level: data.city?.health_risk > 70 ? 'High' : data.city?.health_risk > 40 ? 'Moderate' : 'Low',
        color: data.city?.health_risk > 70 ? 'red' : data.city?.health_risk > 40 ? 'yellow' : 'green'
      },
      foodPrice: {
        status: data.city?.food_stress > 70 ? 'Critical' : data.city?.food_stress > 40 ? 'Elevated' : 'Normal',
        change: data.city?.food_stress ? `${Math.round(data.city.food_stress)}%` : '0%',
        color: data.city?.food_stress > 70 ? 'red' : data.city?.food_stress > 40 ? 'yellow' : 'green'
      },
      weather: {
        alert: data.city?.heat_risk > 70 ? 'Heat Alert' : data.city?.heat_risk > 40 ? 'Moderate' : 'Normal',
        color: data.city?.heat_risk > 70 ? 'red' : data.city?.heat_risk > 40 ? 'yellow' : 'green'
      }
    },
    critical_alerts: data.alerts?.map(alert => ({
      zone: alert.zone_id,
      severity: alert.health_risk > 70 ? 'high' : 'medium',
      message: `Health risk elevated in ${alert.zone_id}`,
      value: alert.health_risk
    })) || [],
    system_health: {
      dataPipeline: {
        status: 'Operational',
        color: 'green'
      }
    },
    correlation_alerts: data.correlation_alerts || []
  };
};

export const checkAPIHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/zones`);
    return response.ok;
  } catch (error) {
    return false;
  }
};
