import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle } from 'lucide-react';
import { useCity } from '../context/CityContext';

const Traffic = () => {
  const { dashboardData, loading, error } = useCity();

  // Loading state
  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading traffic data...</p>
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

  if (!dashboardData) return null;

  // Extract traffic data from API
  const congestionTimeline = dashboardData.traffic?.congestion_timeline || [];
  const routeStatus = dashboardData.traffic?.route_status || [];
  const trafficAnomaly = dashboardData.traffic?.traffic_anomaly || {};
  const publicTransportStatus = dashboardData.traffic?.public_transport_status || {};

  return (
    <div className="p-8 space-y-6">
      {/* Top Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Congestion Timeline */}
        <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700 rounded-xl p-6 backdrop-blur-sm hover:shadow-lg hover:shadow-slate-500/10 transition-all duration-300">
          <h3 className="text-xl font-bold text-white mb-4">Congestion Timeline</h3>
          
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={congestionTimeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis 
                dataKey="hour" 
                stroke="#94a3b8"
                label={{ value: 'Time (hours)', position: 'insideBottom', offset: -5, fill: '#94a3b8' }}
              />
              <YAxis 
                stroke="#94a3b8"
                label={{ value: 'Congestion', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Bar 
                dataKey="congestion" 
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Anomaly Detector */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 backdrop-blur-sm hover:shadow-lg hover:shadow-slate-500/10 transition-all duration-300">
          <h3 className="text-xl font-bold text-white mb-4">Anomaly Detector</h3>
          
          {trafficAnomaly.detected ? (
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg hover:bg-yellow-500/20 hover:border-yellow-500/50 transition-all duration-300">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0 animate-pulse" />
                <div>
                  <p className="text-white font-medium mb-1">Unusual Traffic Pattern Detected</p>
                  <p className="text-slate-400 text-sm mb-2">
                    High congestion on {trafficAnomaly.location} at {trafficAnomaly.time}.
                  </p>
                  <p className="text-slate-400 text-sm">
                    {trafficAnomaly.reason}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 bg-green-400 rounded-full mt-0.5 flex-shrink-0"></div>
                <div>
                  <p className="text-white font-medium mb-1">Normal Traffic Patterns</p>
                  <p className="text-slate-400 text-sm">
                    No anomalies detected in current traffic flow.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Route Status List */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 backdrop-blur-sm hover:shadow-lg hover:shadow-slate-500/10 transition-all duration-300">
          <h3 className="text-xl font-bold text-white mb-4">Route Status List</h3>
          
          <div className="space-y-3">
            {routeStatus.map(route => {
              const dotColor = route.color === 'red' ? 'bg-red-500' : route.color === 'yellow' ? 'bg-yellow-500' : 'bg-green-500';
              const textColor = route.color === 'red' ? 'text-red-400' : route.color === 'yellow' ? 'text-yellow-400' : 'text-green-400';
              
              return (
                <div key={route.id} className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-700 hover:border-slate-600 hover:bg-slate-900/70 transition-all duration-300 cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 ${dotColor} rounded-full animate-pulse`}></div>
                    <div>
                      <p className="text-white font-medium">{route.name}</p>
                      <p className={`text-sm ${textColor}`}>
                        {route.status} (Avg Speed {route.avgSpeed} km/h)
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Public Transport Status */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 backdrop-blur-sm hover:shadow-lg hover:shadow-slate-500/10 transition-all duration-300">
          <h3 className="text-xl font-bold text-white mb-4">Public Transport Status</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-slate-900/50 rounded-lg border border-slate-700 hover:border-green-500/30 hover:bg-slate-900/70 transition-all duration-300 cursor-pointer">
              <span className="text-slate-400">Metro Services</span>
              <span className="text-green-400 font-medium">{publicTransportStatus.metro}</span>
            </div>
            
            <div className="flex justify-between items-center p-4 bg-slate-900/50 rounded-lg border border-slate-700 hover:border-red-500/30 hover:bg-slate-900/70 transition-all duration-300 cursor-pointer">
              <span className="text-slate-400">Bus Network</span>
              <span className="text-red-400 font-medium">{publicTransportStatus.bus}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Traffic;
