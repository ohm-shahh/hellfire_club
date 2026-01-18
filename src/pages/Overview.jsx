import { useState, useEffect, useMemo } from 'react';
import { Car, Activity, Wheat, CloudRain, AlertTriangle, MapPin, Zap, ThermometerSun } from 'lucide-react';
import { useCity } from '../context/CityContext';
import { fetchTrafficData, fetchHealthData } from '../services/api';

const Overview = () => {
  const { dashboardData, loading, error } = useCity();
  const [activeLayer, setActiveLayer] = useState('traffic'); // 'traffic' or 'disease'
  const [trafficData, setTrafficData] = useState(null);
  const [healthData, setHealthData] = useState(null);

  // Fetch additional data for map layers
  useEffect(() => {
    const loadData = async () => {
      try {
        const [traffic, health] = await Promise.all([
          fetchTrafficData(),
          fetchHealthData()
        ]);
        setTrafficData(traffic);
        setHealthData(health);
      } catch (err) {
        console.error('Error loading map data:', err);
      }
    };
    loadData();
  }, []);

  // Smart City zone locations for map (Ahmedabad-inspired grid)
  const zoneLocations = useMemo(() => [
    { id: 1, name: 'CBD/Downtown', x: 45, y: 35, type: 'commercial' },
    { id: 2, name: 'Satellite', x: 25, y: 25, type: 'commercial' },
    { id: 3, name: 'SG Highway', x: 15, y: 45, type: 'commercial' },
    { id: 4, name: 'Maninagar', x: 60, y: 55, type: 'residential' },
    { id: 5, name: 'Navrangpura', x: 40, y: 20, type: 'mixed' },
    { id: 6, name: 'Vastrapur', x: 30, y: 40, type: 'residential' },
    { id: 7, name: 'Bopal', x: 20, y: 65, type: 'residential' },
    { id: 8, name: 'Gota', x: 35, y: 10, type: 'residential' },
    { id: 9, name: 'Chandkheda', x: 50, y: 15, type: 'industrial' },
    { id: 10, name: 'Naroda', x: 75, y: 25, type: 'industrial' },
    { id: 11, name: 'Nikol', x: 80, y: 45, type: 'industrial' },
    { id: 12, name: 'Vastral', x: 85, y: 60, type: 'residential' },
    { id: 13, name: 'Odhav', x: 70, y: 70, type: 'industrial' },
    { id: 14, name: 'Isanpur', x: 55, y: 75, type: 'residential' },
    { id: 15, name: 'Sarkhej', x: 25, y: 80, type: 'mixed' }
  ], []);

  // Generate traffic markers with cars
  const trafficMarkers = useMemo(() => {
    if (!trafficData?.zones) return [];
    
    return zoneLocations.map(zone => {
      const zoneData = trafficData.zones.find(z => z.zone_id === zone.id) || {};
      const congestion = zoneData.congestion_level || Math.random() * 80;
      const status = congestion > 70 ? 'heavy' : congestion > 40 ? 'moderate' : 'light';
      
      return {
        ...zone,
        congestion,
        status,
        emoji: '🚗',
        color: status === 'heavy' ? '#ef4444' : status === 'moderate' ? '#f59e0b' : '#22c55e',
        size: Math.max(16, Math.min(32, congestion / 3))
      };
    });
  }, [trafficData, zoneLocations]);

  // Generate disease markers
  const diseaseMarkers = useMemo(() => {
    const diseases = [
      { name: 'Dengue', emoji: '🦟', riskFactor: 0.8 },
      { name: 'Malaria', emoji: '🦠', riskFactor: 0.6 },
      { name: 'Flu', emoji: '🤒', riskFactor: 0.5 },
      { name: 'COVID', emoji: '😷', riskFactor: 0.4 },
      { name: 'Cholera', emoji: '💧', riskFactor: 0.3 }
    ];
    
    return zoneLocations.map(zone => {
      const disease = diseases[Math.floor(Math.random() * diseases.length)];
      const riskLevel = Math.random() * 100 * disease.riskFactor;
      const status = riskLevel > 60 ? 'high' : riskLevel > 30 ? 'medium' : 'low';
      
      return {
        ...zone,
        disease: disease.name,
        emoji: disease.emoji,
        riskLevel,
        status,
        color: status === 'high' ? '#ef4444' : status === 'medium' ? '#f59e0b' : '#22c55e',
        size: Math.max(16, Math.min(32, riskLevel / 3))
      };
    });
  }, [zoneLocations]);

  // Generate critical alerts
  const criticalAlerts = useMemo(() => {
    const alerts = [];
    
    // Traffic alerts
    if (trafficData?.traffic_anomalies) {
      trafficData.traffic_anomalies.slice(0, 2).forEach((anomaly, i) => {
        alerts.push({
          id: `traffic-${i}`,
          type: 'traffic',
          emoji: '🚨',
          title: `${anomaly.type} - ${anomaly.location}`,
          subtitle: `Impact: ${anomaly.impact}`,
          severity: anomaly.severity
        });
      });
    }
    
    // Health alerts
    if (healthData?.hospital_load) {
      const highRiskHospitals = healthData.hospital_load.filter(h => h.riskLevel === 'High Risk');
      highRiskHospitals.slice(0, 1).forEach((hospital, i) => {
        alerts.push({
          id: `health-${i}`,
          type: 'health',
          emoji: '🏥',
          title: `${hospital.name} - High Load`,
          subtitle: `Predicted surge: ${hospital.predictedSurge}`,
          severity: 'High'
        });
      });
    }
    
    // Weather alert
    alerts.push({
      id: 'weather-1',
      type: 'weather',
      emoji: '⚠️',
      title: 'Heat Wave Advisory',
      subtitle: 'Temperature expected to exceed 40°C',
      severity: 'Medium'
    });
    
    // Disease alert
    alerts.push({
      id: 'disease-1',
      type: 'disease',
      emoji: '🦟',
      title: 'Dengue Risk Elevated',
      subtitle: 'Standing water detected in 5 zones',
      severity: 'High'
    });
    
    return alerts.slice(0, 5);
  }, [trafficData, healthData]);

  // Calculate stats with percentages
  const stats = useMemo(() => {
    if (!dashboardData?.overview_stats) {
      return {
        traffic: { level: 'Moderate', percentage: 42, color: 'yellow' },
        dengue: { level: 'Moderate', percentage: 58, color: 'yellow' },
        foodPrice: { status: 'Elevated', change: '41%', color: 'yellow' },
        weather: { alert: 'Moderate', percentage: 65, color: 'yellow' }
      };
    }
    
    const { overview_stats } = dashboardData;
    return {
      traffic: {
        level: overview_stats.traffic?.level || 'Moderate',
        percentage: overview_stats.traffic?.percentage || 42,
        color: overview_stats.traffic?.color || 'yellow'
      },
      dengue: {
        level: overview_stats.dengueRisk?.level || 'Moderate',
        percentage: Math.round(Math.random() * 40 + 40), // 40-80%
        color: overview_stats.dengueRisk?.color || 'yellow'
      },
      foodPrice: {
        status: overview_stats.foodPrice?.status || 'Elevated',
        change: overview_stats.foodPrice?.change || '41%',
        color: overview_stats.foodPrice?.color || 'yellow'
      },
      weather: {
        alert: overview_stats.weather?.alert || 'Moderate',
        percentage: Math.round(Math.random() * 30 + 50), // 50-80%
        color: overview_stats.weather?.color || 'yellow'
      }
    };
  }, [dashboardData]);

  // Loading state
  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Connection Error</h3>
          <p className="text-slate-400 mb-4">{error}</p>
        </div>
      </div>
    );
  }

  const activeMarkers = activeLayer === 'traffic' ? trafficMarkers : diseaseMarkers;

  // Get color class for stat cards
  const getColorClass = (color) => {
    const colors = {
      green: 'from-green-500/20 to-emerald-600/20 border-green-500/30',
      yellow: 'from-yellow-500/20 to-amber-600/20 border-yellow-500/30',
      red: 'from-red-500/20 to-rose-600/20 border-red-500/30',
      blue: 'from-blue-500/20 to-cyan-600/20 border-blue-500/30'
    };
    return colors[color] || colors.yellow;
  };

  const getTextColor = (color) => {
    const colors = {
      green: 'text-green-400',
      yellow: 'text-yellow-400',
      red: 'text-red-400',
      blue: 'text-blue-400'
    };
    return colors[color] || colors.yellow;
  };

  const getSeverityColor = (severity) => {
    const colors = {
      'Critical': 'bg-red-500/20 border-red-500/40 text-red-400',
      'High': 'bg-orange-500/20 border-orange-500/40 text-orange-400',
      'Medium': 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400',
      'Low': 'bg-green-500/20 border-green-500/40 text-green-400'
    };
    return colors[severity] || colors['Medium'];
  };

  return (
    <div className="p-8 space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Traffic Congestion */}
        <div className={`bg-gradient-to-br ${getColorClass(stats.traffic.color)} border rounded-xl p-5 backdrop-blur-sm`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Avg Traffic Congestion</p>
              <p className={`text-2xl font-bold ${getTextColor(stats.traffic.color)} mt-1`}>
                {stats.traffic.level}
              </p>
              <p className={`text-lg font-semibold ${getTextColor(stats.traffic.color)}`}>
                ({stats.traffic.percentage}%)
              </p>
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stats.traffic.color === 'green' ? 'bg-green-500/20' : stats.traffic.color === 'red' ? 'bg-red-500/20' : 'bg-yellow-500/20'}`}>
              <Car className={`w-6 h-6 ${getTextColor(stats.traffic.color)}`} />
            </div>
          </div>
        </div>

        {/* Dengue Risk */}
        <div className={`bg-gradient-to-br ${getColorClass(stats.dengue.color)} border rounded-xl p-5 backdrop-blur-sm`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Dengue Risk Level</p>
              <p className={`text-2xl font-bold ${getTextColor(stats.dengue.color)} mt-1`}>
                {stats.dengue.level}
              </p>
              <p className={`text-lg font-semibold ${getTextColor(stats.dengue.color)}`}>
                ({stats.dengue.percentage}%)
              </p>
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stats.dengue.color === 'green' ? 'bg-green-500/20' : stats.dengue.color === 'red' ? 'bg-red-500/20' : 'bg-yellow-500/20'}`}>
              <Activity className={`w-6 h-6 ${getTextColor(stats.dengue.color)}`} />
            </div>
          </div>
        </div>

        {/* Food Price */}
        <div className={`bg-gradient-to-br ${getColorClass(stats.foodPrice.color)} border rounded-xl p-5 backdrop-blur-sm`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Food Price Index</p>
              <p className={`text-2xl font-bold ${getTextColor(stats.foodPrice.color)} mt-1`}>
                {stats.foodPrice.status}
              </p>
              <p className="text-slate-400 text-sm">{stats.foodPrice.change}</p>
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stats.foodPrice.color === 'green' ? 'bg-green-500/20' : stats.foodPrice.color === 'red' ? 'bg-red-500/20' : 'bg-yellow-500/20'}`}>
              <Wheat className={`w-6 h-6 ${getTextColor(stats.foodPrice.color)}`} />
            </div>
          </div>
        </div>

        {/* Weather Alert */}
        <div className={`bg-gradient-to-br ${getColorClass(stats.weather.color)} border rounded-xl p-5 backdrop-blur-sm`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Weather Alert Status</p>
              <p className={`text-2xl font-bold ${getTextColor(stats.weather.color)} mt-1`}>
                {stats.weather.alert}
              </p>
              <p className={`text-lg font-semibold ${getTextColor(stats.weather.color)}`}>
                ({stats.weather.percentage}%)
              </p>
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stats.weather.color === 'green' ? 'bg-green-500/20' : stats.weather.color === 'red' ? 'bg-red-500/20' : 'bg-yellow-500/20'}`}>
              <CloudRain className={`w-6 h-6 ${getTextColor(stats.weather.color)}`} />
            </div>
          </div>
        </div>
      </div>

      {/* Map and Alerts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Risk Map */}
        <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700 rounded-xl p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">Composite Risk Map</h3>
            <div className="flex space-x-2">
              <button 
                onClick={() => setActiveLayer('traffic')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  activeLayer === 'traffic' 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                🚗 Traffic Layer
              </button>
              <button 
                onClick={() => setActiveLayer('disease')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  activeLayer === 'disease' 
                    ? 'bg-red-600 text-white shadow-lg shadow-red-500/30' 
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                🦟 Disease Risk Layer
              </button>
            </div>
          </div>
          
          {/* Map Container */}
          <div className="relative w-full h-80 bg-slate-900 rounded-lg border border-slate-700 overflow-hidden">
            {/* Grid Background */}
            <div className="absolute inset-0 opacity-20">
              <svg width="100%" height="100%">
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#475569" strokeWidth="0.5"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>
            
            {/* City Outline - Stylized */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              {/* Main roads */}
              <path d="M 10 50 L 90 50" stroke="#334155" strokeWidth="0.8" fill="none" opacity="0.5"/>
              <path d="M 50 10 L 50 90" stroke="#334155" strokeWidth="0.8" fill="none" opacity="0.5"/>
              <path d="M 20 20 L 80 80" stroke="#334155" strokeWidth="0.5" fill="none" opacity="0.3"/>
              <path d="M 80 20 L 20 80" stroke="#334155" strokeWidth="0.5" fill="none" opacity="0.3"/>
              
              {/* Ring roads */}
              <circle cx="50" cy="50" r="30" stroke="#334155" strokeWidth="0.5" fill="none" opacity="0.4"/>
              <circle cx="50" cy="50" r="45" stroke="#334155" strokeWidth="0.5" fill="none" opacity="0.3"/>
            </svg>
            
            {/* Risk Heatmap Gradient Overlay */}
            <div className="absolute inset-0 pointer-events-none">
              {activeMarkers.map((marker, idx) => (
                <div
                  key={idx}
                  className="absolute rounded-full blur-xl opacity-30"
                  style={{
                    left: `${marker.x}%`,
                    top: `${marker.y}%`,
                    width: `${marker.size * 3}px`,
                    height: `${marker.size * 3}px`,
                    backgroundColor: marker.color,
                    transform: 'translate(-50%, -50%)'
                  }}
                />
              ))}
            </div>
            
            {/* Zone Markers with Emojis */}
            {activeMarkers.map((marker, idx) => (
              <div
                key={idx}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group transition-all duration-300 hover:scale-125 hover:z-10"
                style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
              >
                {/* Pulsing Ring */}
                <div 
                  className="absolute inset-0 rounded-full animate-ping opacity-50"
                  style={{ 
                    backgroundColor: marker.color,
                    width: `${marker.size}px`,
                    height: `${marker.size}px`,
                    transform: 'translate(-50%, -50%)',
                    left: '50%',
                    top: '50%'
                  }}
                />
                
                {/* Marker Dot */}
                <div 
                  className="relative rounded-full flex items-center justify-center shadow-lg"
                  style={{ 
                    backgroundColor: marker.color,
                    width: `${marker.size}px`,
                    height: `${marker.size}px`,
                    fontSize: `${Math.max(10, marker.size / 2)}px`
                  }}
                >
                  <span>{marker.emoji}</span>
                </div>
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-20">
                  <div className="bg-slate-800 border border-slate-600 rounded-lg p-2 shadow-xl whitespace-nowrap">
                    <p className="text-white text-xs font-medium">{marker.name}</p>
                    {activeLayer === 'traffic' ? (
                      <p className="text-xs" style={{ color: marker.color }}>
                        Congestion: {marker.congestion?.toFixed(0)}%
                      </p>
                    ) : (
                      <>
                        <p className="text-xs" style={{ color: marker.color }}>
                          {marker.disease}: {marker.riskLevel?.toFixed(0)}%
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Legend */}
            <div className="absolute bottom-3 left-3 bg-slate-800/90 rounded-lg p-2 border border-slate-600">
              <p className="text-white text-xs font-medium mb-1">
                {activeLayer === 'traffic' ? '🚗 Traffic Density' : '🦟 Disease Risk'}
              </p>
              <div className="flex items-center space-x-2 text-xs">
                <span className="flex items-center"><span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>Low</span>
                <span className="flex items-center"><span className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></span>Medium</span>
                <span className="flex items-center"><span className="w-2 h-2 bg-red-500 rounded-full mr-1"></span>High</span>
              </div>
            </div>
            
            {/* Map Title */}
            <div className="absolute top-3 left-3 bg-slate-800/90 rounded-lg px-3 py-1 border border-slate-600">
              <p className="text-white text-xs font-medium">Smart City Risk Heatmap</p>
            </div>
          </div>
        </div>

        {/* Right Column - Alerts & System Health */}
        <div className="space-y-6">
          {/* Critical Alerts */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Critical Alerts</h3>
              <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-medium">
                {criticalAlerts.length} Active
              </span>
            </div>
            
            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
              {criticalAlerts.map((alert) => (
                <div 
                  key={alert.id}
                  className={`flex items-start space-x-3 p-3 rounded-lg border transition-all duration-300 hover:scale-[1.02] cursor-pointer ${getSeverityColor(alert.severity)}`}
                >
                  <span className="text-xl flex-shrink-0">{alert.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm truncate">{alert.title}</p>
                    <p className="text-slate-400 text-xs truncate">{alert.subtitle}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                    {alert.severity}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          {/* System Health */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 backdrop-blur-sm">
            <h3 className="text-xl font-bold text-white mb-4">System Health</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-700">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-slate-400 text-sm">Data Pipeline</span>
                </div>
                <span className="text-green-400 font-medium text-sm">Operational</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-700">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-slate-400 text-sm">ML Models</span>
                </div>
                <span className="text-green-400 font-medium text-sm">Active</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-700">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-slate-400 text-sm">API Services</span>
                </div>
                <span className="text-green-400 font-medium text-sm">Online</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-700">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                  <span className="text-slate-400 text-sm">Sensor Network</span>
                </div>
                <span className="text-yellow-400 font-medium text-sm">98.5% Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
