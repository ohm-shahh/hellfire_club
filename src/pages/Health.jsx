import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, BarChart, Bar, Cell } from 'recharts';
import { useCity } from '../context/CityContext';

const Health = () => {
  const { dashboardData, loading, error } = useCity();

  // Loading state
  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading health data...</p>
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

  // Extract health data from API
  const healthData = dashboardData.health || {};
  const weatherDiseaseCorrelation = healthData.weather_disease_correlation || [];
  const environmentalRisk = healthData.environmental_risk || {};
  const hospitalLoad = healthData.hospital_load || [];

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-xl">
          <p className="text-slate-300 font-medium mb-2">Day {label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Get color based on risk level
  const getRiskColor = (level) => {
    if (level === 'High' || level === 'High Risk') return 'text-red-400';
    if (level === 'Moderate' || level === 'Medium Risk') return 'text-yellow-400';
    return 'text-green-400';
  };

  const getRiskBgColor = (level) => {
    if (level === 'High' || level === 'High Risk') return 'bg-red-500/20 border-red-500/30';
    if (level === 'Moderate' || level === 'Medium Risk') return 'bg-yellow-500/20 border-yellow-500/30';
    return 'bg-green-500/20 border-green-500/30';
  };

  // Calculate progress bar width
  const getProgressWidth = (value, max = 100) => {
    return `${Math.min(100, (value / max) * 100)}%`;
  };

  return (
    <div className="p-8 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Health Monitoring</h1>
          <p className="text-slate-400 mt-1">Weather-disease correlation & hospital capacity analysis</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-green-400 text-sm font-medium">Live Data</span>
        </div>
      </div>

      {/* Top Section: Chart and Risk Factors */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Weather & Disease Correlation Chart */}
        <div className="lg:col-span-3 bg-slate-800/50 border border-slate-700 rounded-xl p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Weather & Disease Correlation</h3>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-slate-400">Rainfall</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-slate-400">Disease Cases</span>
              </div>
            </div>
          </div>
          
          {weatherDiseaseCorrelation.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={weatherDiseaseCorrelation}>
                  <defs>
                    <linearGradient id="colorRainfall" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorCases" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis 
                    dataKey="day" 
                    stroke="#94a3b8"
                    tickLine={false}
                    axisLine={{ stroke: '#475569' }}
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                  />
                  <YAxis 
                    yAxisId="left"
                    stroke="#3b82f6"
                    tickLine={false}
                    axisLine={{ stroke: '#475569' }}
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    label={{ value: 'Rainfall (mm)', angle: -90, position: 'insideLeft', fill: '#3b82f6', fontSize: 12 }}
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    stroke="#ef4444"
                    tickLine={false}
                    axisLine={{ stroke: '#475569' }}
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    label={{ value: 'Disease Cases', angle: 90, position: 'insideRight', fill: '#ef4444', fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="rainfall" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    fill="url(#colorRainfall)"
                    name="Rainfall (mm)"
                    dot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
                  />
                  <Area 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="cases" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    fill="url(#colorCases)"
                    name="Disease Cases"
                    dot={{ r: 4, fill: '#ef4444', strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: '#ef4444', stroke: '#fff', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>

              {/* Insight Box */}
              <div className="mt-4 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-400">💡</span>
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1">Correlation Insight</h4>
                    <p className="text-slate-400 text-sm">
                      Disease cases typically increase 2-3 days after heavy rainfall due to standing water and mosquito breeding. 
                      Current trend shows {weatherDiseaseCorrelation[weatherDiseaseCorrelation.length - 1]?.cases || 0} projected cases with 
                      {' '}{weatherDiseaseCorrelation[weatherDiseaseCorrelation.length - 1]?.rainfall || 0}mm recent rainfall.
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="h-[320px] flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">📊</span>
                </div>
                <p className="text-slate-400">Loading correlation data...</p>
              </div>
            </div>
          )}
        </div>

        {/* Environmental Risk Factors */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 backdrop-blur-sm">
          <h3 className="text-xl font-bold text-white mb-6">Environmental Risk Factors</h3>
          
          <div className="space-y-6">
            {/* Humidity */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-400 flex items-center gap-2">
                  <span>💧</span> Humidity
                </span>
                <span className={`font-semibold ${getRiskColor(environmentalRisk.humidityLevel)}`}>
                  {environmentalRisk.humidity || '--'}% 
                </span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    environmentalRisk.humidityLevel === 'High' ? 'bg-red-500' :
                    environmentalRisk.humidityLevel === 'Moderate' ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: getProgressWidth(environmentalRisk.humidity || 0) }}
                ></div>
              </div>
              <p className={`text-xs mt-1 ${getRiskColor(environmentalRisk.humidityLevel)}`}>
                {environmentalRisk.humidityLevel || 'Unknown'} Risk
              </p>
            </div>

            {/* Temperature */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-400 flex items-center gap-2">
                  <span>🌡️</span> Temperature
                </span>
                <span className="text-white font-semibold">{environmentalRisk.temperature || '--'}°C</span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    (environmentalRisk.temperature || 0) > 38 ? 'bg-red-500' :
                    (environmentalRisk.temperature || 0) > 32 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: getProgressWidth(environmentalRisk.temperature || 0, 50) }}
                ></div>
              </div>
              <p className={`text-xs mt-1 ${
                (environmentalRisk.temperature || 0) > 38 ? 'text-red-400' :
                (environmentalRisk.temperature || 0) > 32 ? 'text-yellow-400' : 'text-green-400'
              }`}>
                {(environmentalRisk.temperature || 0) > 38 ? 'Heat Alert' :
                 (environmentalRisk.temperature || 0) > 32 ? 'Warm' : 'Normal'}
              </p>
            </div>

            {/* Standing Water Index */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-400 flex items-center gap-2">
                  <span>🌊</span> Standing Water
                </span>
                <span className={`font-semibold ${getRiskColor(environmentalRisk.standingWaterIndex)}`}>
                  {environmentalRisk.standingWaterIndex || '--'}
                </span>
              </div>
              <div className={`p-3 rounded-lg border ${getRiskBgColor(environmentalRisk.standingWaterIndex)}`}>
                <p className="text-xs text-slate-300">
                  {environmentalRisk.standingWaterIndex === 'High' 
                    ? '⚠️ High risk of mosquito breeding' 
                    : environmentalRisk.standingWaterIndex === 'Moderate'
                    ? '⚡ Moderate conditions, monitor closely'
                    : '✅ Low risk conditions'}
                </p>
              </div>
            </div>

            {/* Overall Risk Score */}
            <div className="pt-4 border-t border-slate-700">
              <div className="text-center">
                <p className="text-slate-400 text-sm mb-2">Overall Health Risk</p>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${getRiskBgColor(environmentalRisk.humidityLevel)}`}>
                  <div className={`w-3 h-3 rounded-full animate-pulse ${
                    environmentalRisk.humidityLevel === 'High' ? 'bg-red-400' :
                    environmentalRisk.humidityLevel === 'Moderate' ? 'bg-yellow-400' : 'bg-green-400'
                  }`}></div>
                  <span className={`font-bold ${getRiskColor(environmentalRisk.humidityLevel)}`}>
                    {environmentalRisk.humidityLevel || 'Calculating...'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hospital Load Table */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Hospital Load & Predicted Surge</h3>
          <div className="text-sm text-slate-400">
            {hospitalLoad.length} Hospitals Monitored
          </div>
        </div>
        
        {hospitalLoad.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-4 px-4 text-slate-400 font-medium">Hospital Name</th>
                  <th className="text-left py-4 px-4 text-slate-400 font-medium">Capacity</th>
                  <th className="text-left py-4 px-4 text-slate-400 font-medium">Occupancy</th>
                  <th className="text-left py-4 px-4 text-slate-400 font-medium">Predicted Surge (4 Days)</th>
                  <th className="text-left py-4 px-4 text-slate-400 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {hospitalLoad.map(hospital => {
                  const occupancyPct = ((hospital.totalBeds - hospital.availableBeds) / hospital.totalBeds) * 100;
                  return (
                    <tr key={hospital.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                            <span>🏥</span>
                          </div>
                          <span className="text-white font-medium">{hospital.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-white">{hospital.availableBeds}</span>
                        <span className="text-slate-400"> / {hospital.totalBeds} beds</span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                occupancyPct > 80 ? 'bg-red-500' :
                                occupancyPct > 60 ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${occupancyPct}%` }}
                            ></div>
                          </div>
                          <span className={`text-sm ${
                            occupancyPct > 80 ? 'text-red-400' :
                            occupancyPct > 60 ? 'text-yellow-400' : 'text-green-400'
                          }`}>{Math.round(occupancyPct)}%</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`font-semibold ${
                          hospital.riskLevel === 'High Risk' ? 'text-red-400' : 
                          hospital.riskLevel === 'Medium Risk' ? 'text-yellow-400' : 
                          'text-green-400'
                        }`}>
                          {hospital.predictedSurge}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm ${getRiskBgColor(hospital.riskLevel)}`}>
                          <div className={`w-2 h-2 rounded-full ${
                            hospital.riskLevel === 'High Risk' ? 'bg-red-400' :
                            hospital.riskLevel === 'Medium Risk' ? 'bg-yellow-400' : 'bg-green-400'
                          }`}></div>
                          <span className={getRiskColor(hospital.riskLevel)}>
                            {hospital.riskLevel}
                          </span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="h-48 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🏥</span>
              </div>
              <p className="text-slate-400">Loading hospital data...</p>
            </div>
          </div>
        )}
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-500/30 rounded-lg flex items-center justify-center">
              <span className="text-2xl">💧</span>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Avg Humidity</p>
              <p className="text-white text-xl font-bold">{environmentalRisk.humidity || '--'}%</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-500/30 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-500/30 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🌡️</span>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Temperature</p>
              <p className="text-white text-xl font-bold">{environmentalRisk.temperature || '--'}°C</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-500/30 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🏥</span>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Total Hospitals</p>
              <p className="text-white text-xl font-bold">{hospitalLoad.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-500/30 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🛏️</span>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Available Beds</p>
              <p className="text-white text-xl font-bold">
                {hospitalLoad.reduce((sum, h) => sum + h.availableBeds, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Health;
