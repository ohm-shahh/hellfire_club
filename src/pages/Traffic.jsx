import { useState, useEffect } from 'react';
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, LineChart, Line, Legend 
} from 'recharts';
import { 
  AlertTriangle, Car, Bus, Train, TrendingUp, TrendingDown, 
  Minus, Clock, MapPin, Activity, AlertCircle, Navigation
} from 'lucide-react';
import { useCity } from '../context/CityContext';
import { fetchTrafficData } from '../services/api';

const Traffic = () => {
  const { loading: contextLoading, error: contextError } = useCity();
  const [trafficData, setTrafficData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadTrafficData = async () => {
      try {
        setLoading(true);
        const data = await fetchTrafficData();
        setTrafficData(data);
        setError(null);
      } catch (err) {
        console.error('Error loading traffic data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadTrafficData();
    const interval = setInterval(loadTrafficData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Loading state
  if (loading || contextLoading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading traffic data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || contextError) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Connection Error</h3>
          <p className="text-slate-400 mb-4">{error || contextError}</p>
        </div>
      </div>
    );
  }

  if (!trafficData) return null;

  // Extract data from API response
  const hourlyCongestion = trafficData.hourly_congestion || [];
  const routeStatus = trafficData.route_status || [];
  const trafficAnomalies = trafficData.traffic_anomalies || [];
  const publicTransport = trafficData.public_transport || [];
  const weeklyTrend = trafficData.weekly_trend || [];
  const summary = trafficData.summary || {};
  const zones = trafficData.zones || [];

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-xl">
          <p className="text-slate-300 text-sm mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm font-medium" style={{ color: entry.color }}>
              {entry.name}: {entry.value}%
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Get trend icon
  const getTrendIcon = (trend) => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-red-400" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-green-400" />;
    return <Minus className="w-4 h-4 text-slate-400" />;
  };

  // Get status color
  const getStatusColor = (status) => {
    if (status === 'Heavy') return { bg: 'bg-red-500', text: 'text-red-400', border: 'border-red-500/30' };
    if (status === 'Moderate') return { bg: 'bg-yellow-500', text: 'text-yellow-400', border: 'border-yellow-500/30' };
    return { bg: 'bg-green-500', text: 'text-green-400', border: 'border-green-500/30' };
  };

  // Get severity color
  const getSeverityColor = (severity) => {
    const colors = {
      'Critical': 'bg-red-500/20 text-red-400 border-red-500/30',
      'High': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      'Medium': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'Low': 'bg-green-500/20 text-green-400 border-green-500/30'
    };
    return colors[severity] || colors['Low'];
  };

  return (
    <div className="p-8 space-y-6">
      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 rounded-xl p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Traffic Index</p>
              <p className="text-3xl font-bold text-white mt-1">{summary.trafficIndex || 65}</p>
              <p className="text-cyan-400 text-xs mt-1">Real-time score</p>
            </div>
            <div className="w-14 h-14 bg-cyan-500/20 rounded-full flex items-center justify-center">
              <Activity className="w-7 h-7 text-cyan-400" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500/20 to-red-600/20 border border-orange-500/30 rounded-xl p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Avg Congestion</p>
              <p className="text-3xl font-bold text-white mt-1">{summary.avgCongestion || 45}%</p>
              <p className="text-orange-400 text-xs mt-1">City-wide average</p>
            </div>
            <div className="w-14 h-14 bg-orange-500/20 rounded-full flex items-center justify-center">
              <Car className="w-7 h-7 text-orange-400" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500/20 to-pink-600/20 border border-red-500/30 rounded-xl p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Active Incidents</p>
              <p className="text-3xl font-bold text-white mt-1">{trafficAnomalies.length}</p>
              <p className="text-red-400 text-xs mt-1">Requires attention</p>
            </div>
            <div className="w-14 h-14 bg-red-500/20 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-7 h-7 text-red-400" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 border border-green-500/30 rounded-xl p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Peak Hour</p>
              <p className="text-3xl font-bold text-white mt-1">{summary.peakHour || '9:00 AM'}</p>
              <p className="text-green-400 text-xs mt-1">Highest traffic</p>
            </div>
            <div className="w-14 h-14 bg-green-500/20 rounded-full flex items-center justify-center">
              <Clock className="w-7 h-7 text-green-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hourly Congestion Chart */}
        <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700 rounded-xl p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">24-Hour Congestion Pattern</h3>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-cyan-400 rounded-full"></div>
              <span className="text-slate-400 text-sm">Congestion Level</span>
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={hourlyCongestion}>
              <defs>
                <linearGradient id="congestionGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis 
                dataKey="label" 
                stroke="#94a3b8"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                interval={2}
              />
              <YAxis 
                stroke="#94a3b8"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="congestion" 
                stroke="#06b6d4" 
                strokeWidth={2}
                fill="url(#congestionGradient)"
                name="Congestion"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Traffic Anomalies */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">Active Incidents</h3>
            <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-medium">
              {trafficAnomalies.length} Active
            </span>
          </div>
          
          <div className="space-y-3 max-h-[280px] overflow-y-auto pr-2 custom-scrollbar">
            {trafficAnomalies.length > 0 ? trafficAnomalies.map((anomaly, idx) => (
              <div 
                key={idx}
                className={`p-3 rounded-lg border ${getSeverityColor(anomaly.severity)} transition-all duration-300 hover:scale-[1.02]`}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="font-medium text-white text-sm">{anomaly.type}</span>
                  <span className={`px-2 py-0.5 rounded text-xs ${getSeverityColor(anomaly.severity)}`}>
                    {anomaly.severity}
                  </span>
                </div>
                <div className="flex items-center text-slate-400 text-xs mb-1">
                  <MapPin className="w-3 h-3 mr-1" />
                  {anomaly.location}
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Impact: {anomaly.impact}</span>
                  <span className="text-slate-500">ETA: {anomaly.estimatedClearTime}</span>
                </div>
              </div>
            )) : (
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-center">
                <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Activity className="w-5 h-5 text-green-400" />
                </div>
                <p className="text-green-400 font-medium">All Clear</p>
                <p className="text-slate-400 text-sm">No active incidents</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Weekly Trend & Route Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Traffic Trend */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 backdrop-blur-sm">
          <h3 className="text-xl font-bold text-white mb-4">Weekly Traffic Trend</h3>
          
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weeklyTrend} barGap={8}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="day" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: '10px' }}
                formatter={(value) => <span className="text-slate-300 text-sm">{value}</span>}
              />
              <Bar 
                dataKey="peakCongestion" 
                fill="#ef4444" 
                radius={[4, 4, 0, 0]} 
                name="Peak Hours"
              />
              <Bar 
                dataKey="offPeakCongestion" 
                fill="#22c55e" 
                radius={[4, 4, 0, 0]} 
                name="Off-Peak"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Route Status */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 backdrop-blur-sm">
          <h3 className="text-xl font-bold text-white mb-4">Major Routes Status</h3>
          
          <div className="space-y-3 max-h-[280px] overflow-y-auto pr-2">
            {routeStatus.map((route, idx) => {
              const statusColor = getStatusColor(route.status);
              return (
                <div 
                  key={idx}
                  className={`p-4 bg-slate-900/50 rounded-lg border ${statusColor.border} hover:bg-slate-900/70 transition-all duration-300`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 ${statusColor.bg} rounded-full animate-pulse`}></div>
                      <div>
                        <p className="text-white font-medium">{route.name}</p>
                        <p className="text-slate-500 text-xs">{route.length} km</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${statusColor.text} bg-slate-800`}>
                        {route.status}
                      </span>
                      {getTrendIcon(route.trend)}
                    </div>
                  </div>
                  
                  {/* Congestion bar */}
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Congestion: {route.congestion}%</span>
                      <span>Avg Speed: {route.avgSpeed} km/h</span>
                    </div>
                    <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${statusColor.bg} rounded-full transition-all duration-500`}
                        style={{ width: `${route.congestion}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Public Transport Status */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 backdrop-blur-sm">
        <h3 className="text-xl font-bold text-white mb-4">Public Transport Overview</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {publicTransport.map((transport, idx) => {
            const IconComponent = transport.icon === 'train' ? Train : 
                                  transport.icon === 'bus' ? Bus : Car;
            const isHealthy = transport.onTimePct > 85;
            
            return (
              <div 
                key={idx}
                className="p-4 bg-slate-900/50 rounded-lg border border-slate-700 hover:border-cyan-500/30 transition-all duration-300"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isHealthy ? 'bg-green-500/20' : 'bg-yellow-500/20'}`}>
                    <IconComponent className={`w-5 h-5 ${isHealthy ? 'text-green-400' : 'text-yellow-400'}`} />
                  </div>
                  <div>
                    <p className="text-white font-medium">{transport.type}</p>
                    <p className="text-slate-500 text-xs">{transport.active}/{transport.totalFleet} Active</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Fleet Active</span>
                      <span className="text-white">{transport.activePct}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-cyan-500 rounded-full"
                        style={{ width: `${transport.activePct}%` }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">On-Time</span>
                      <span className={isHealthy ? 'text-green-400' : 'text-yellow-400'}>{transport.onTimePct}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${isHealthy ? 'bg-green-500' : 'bg-yellow-500'}`}
                        style={{ width: `${transport.onTimePct}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t border-slate-700">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Avg Occupancy</span>
                      <span className="text-white">{transport.avgOccupancy}%</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Zone Status Grid */}
      {zones.length > 0 && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 backdrop-blur-sm">
          <h3 className="text-xl font-bold text-white mb-4">Zone Traffic Status</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {zones.slice(0, 10).map((zone, idx) => {
              const statusColor = getStatusColor(zone.status);
              return (
                <div 
                  key={idx}
                  className={`p-3 rounded-lg border ${statusColor.border} bg-slate-900/50 text-center hover:scale-105 transition-all duration-300`}
                >
                  <div className={`w-8 h-8 ${statusColor.bg}/20 rounded-full flex items-center justify-center mx-auto mb-2`}>
                    <Navigation className={`w-4 h-4 ${statusColor.text}`} />
                  </div>
                  <p className="text-white text-sm font-medium">Zone {zone.zone_id}</p>
                  <p className={`text-xs ${statusColor.text}`}>{zone.status}</p>
                  <p className="text-slate-500 text-xs mt-1">{zone.avg_speed} km/h</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Traffic;
