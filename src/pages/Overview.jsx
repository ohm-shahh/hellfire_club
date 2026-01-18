import { Car, Activity, Wheat, CloudRain } from 'lucide-react';
import { useCity } from '../context/CityContext';
import StatCard from '../components/ui/StatCard';
import AlertCard from '../components/ui/AlertCard';

const Overview = () => {
  const { dashboardData, loading, error } = useCity();

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
          <p className="text-sm text-slate-500">
            Make sure the Flask API server is running at http://localhost:5000
          </p>
        </div>
      </div>
    );
  }

  // No data state
  if (!dashboardData) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <p className="text-slate-400">No data available</p>
      </div>
    );
  }

  // Extract data from API response
  const { overview_stats, critical_alerts, system_health } = dashboardData;

  return (
    <div className="p-8 space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Car}
          label="Avg Traffic Congestion"
          value={`${overview_stats.traffic.level} (${overview_stats.traffic.percentage}%)`}
          color={overview_stats.traffic.color}
        />
        
        <StatCard
          icon={Activity}
          label="Dengue Risk Level"
          value={overview_stats.dengueRisk.level}
          color={overview_stats.dengueRisk.color}
        />
        
        <StatCard
          icon={Wheat}
          label="Food Price Index"
          value={overview_stats.foodPrice.status}
          subtitle={overview_stats.foodPrice.change}
          color={overview_stats.foodPrice.color}
        />
        
        <StatCard
          icon={CloudRain}
          label="Weather Alert Status"
          value={overview_stats.weather.alert}
          color={overview_stats.weather.color}
        />
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Composite Risk Map Placeholder */}
        <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700 rounded-xl p-6 backdrop-blur-sm h-96 hover:shadow-lg hover:shadow-slate-500/10 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">Composite Risk Map</h3>
            <div className="flex space-x-2">
              <button className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg text-sm hover:bg-slate-600 transition-all duration-300">
                Traffic Layer
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-500 transition-all duration-300 shadow-lg shadow-blue-500/30">
                Disease Risk Layer
              </button>
            </div>
          </div>
          
          <div className="w-full h-72 bg-slate-900 rounded-lg flex items-center justify-center border border-slate-700 hover:border-slate-600 transition-all duration-300">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-500/20 rounded-full flex items-center justify-center animate-pulse">
                <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
              </div>
              <p className="text-slate-400 mb-2">Map Visualization</p>
              <p className="text-slate-500 text-sm">{dashboardData.city_name} City Risk Heatmap</p>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Critical Alerts */}
          <AlertCard alerts={critical_alerts} />
          
          {/* System Health */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 backdrop-blur-sm hover:shadow-lg hover:shadow-slate-500/10 transition-all duration-300">
            <h3 className="text-xl font-bold text-white mb-4">System Health</h3>
            <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-700 hover:border-green-500/30 transition-all duration-300">
              <span className="text-slate-400">Data Pipeline</span>
              <div className="flex items-center space-x-2">
                <span className="text-green-400 font-medium">{system_health.dataPipeline.status}</span>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400">{system_health.dataPipeline.color}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
