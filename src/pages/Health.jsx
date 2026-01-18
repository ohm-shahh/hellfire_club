import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
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
  const weatherDiseaseCorrelation = dashboardData.health?.weather_disease_correlation || [];
  const environmentalRisk = dashboardData.health?.environmental_risk || {};
  const hospitalLoad = dashboardData.health?.hospital_load || [];

  return (
    <div className="p-8 space-y-6">
      {/* Top Section: Chart and Risk Factors */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Weather & Disease Correlation Chart */}
        <div className="lg:col-span-3 bg-slate-800/50 border border-slate-700 rounded-xl p-6 backdrop-blur-sm">
          <h3 className="text-xl font-bold text-white mb-4">Weather & Disease Correlation</h3>
          
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weatherDiseaseCorrelation}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis 
                dataKey="day" 
                stroke="#94a3b8"
                label={{ value: 'Time (Days)', position: 'insideBottom', offset: -5, fill: '#94a3b8' }}
              />
              <YAxis 
                yAxisId="left"
                stroke="#3b82f6"
                label={{ value: 'Rainfall (mm)', angle: -90, position: 'insideLeft', fill: '#3b82f6' }}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                stroke="#ef4444"
                label={{ value: 'Disease Cases (Projected)', angle: 90, position: 'insideRight', fill: '#ef4444' }}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Legend />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="rainfall" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="Rainfall (mm)"
                dot={{ r: 3 }}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="cases" 
                stroke="#ef4444" 
                strokeWidth={2}
                name="Disease Cases"
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>

          {weatherDiseaseCorrelation.length > 5 && (
            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-blue-400 text-sm">
                <span className="font-semibold">Day {weatherDiseaseCorrelation[5].day}:</span> Rainfall {weatherDiseaseCorrelation[5].rainfall}mm • Cases {weatherDiseaseCorrelation[5].cases}
              </p>
            </div>
          )}
        </div>

        {/* Environmental Risk Factors */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 backdrop-blur-sm">
          <h3 className="text-xl font-bold text-white mb-4">Environmental Risk Factors</h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-400">Humidity</span>
                <span className={`font-semibold ${
                  environmentalRisk.humidityLevel === 'High' ? 'text-red-400' : 
                  environmentalRisk.humidityLevel === 'Moderate' ? 'text-yellow-400' : 
                  'text-green-400'
                }`}>
                  {environmentalRisk.humidity}% ({environmentalRisk.humidityLevel})
                </span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-400">Temp</span>
                <span className="text-white font-semibold">{environmentalRisk.temperature}°C</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-400">Standing Water Index</span>
                <span className={`font-semibold ${
                  environmentalRisk.standingWaterIndex === 'High' ? 'text-red-400' : 
                  environmentalRisk.standingWaterIndex === 'Moderate' ? 'text-yellow-400' : 
                  'text-green-400'
                }`}>
                  {environmentalRisk.standingWaterIndex}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hospital Load Table */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 backdrop-blur-sm">
        <h3 className="text-xl font-bold text-white mb-4">Hospital Load & Predicted Surge</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Hospital Name</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Available Beds</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Predicted Surge (Next 4 Days)</th>
              </tr>
            </thead>
            <tbody>
              {hospitalLoad.map(hospital => (
                <tr key={hospital.id} className="border-b border-slate-700/50">
                  <td className="py-3 px-4 text-white">{hospital.name}</td>
                  <td className="py-3 px-4 text-white">{hospital.availableBeds} / {hospital.totalBeds}</td>
                  <td className="py-3 px-4">
                    <span className={`font-semibold ${
                      hospital.riskLevel === 'High Risk' ? 'text-red-400' : 
                      hospital.riskLevel === 'Medium Risk' ? 'text-yellow-400' : 
                      'text-green-400'
                    }`}>
                      {hospital.predictedSurge}
                    </span>
                    <span className="text-slate-400 ml-2">({hospital.riskLevel})</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Health;
