import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Sprout, Truck, Warehouse, Users, TrendingUp, AlertTriangle } from 'lucide-react';
import { useCity } from '../context/CityContext';

const Agriculture = () => {
  const { dashboardData, loading, error } = useCity();

  // Loading state
  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading agriculture data...</p>
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

  // Extract agriculture data from API
  const supplyChainStages = dashboardData.agriculture?.supply_chain_stages || [];
  const priceVolatility = dashboardData.agriculture?.price_volatility || [];
  const priceSpike = dashboardData.agriculture?.price_spike || {};
  const spoilageRisk = dashboardData.agriculture?.spoilage_risk || {};
  const marketInventory = dashboardData.agriculture?.market_inventory || {};

  // Icon mapping
  const iconMap = {
    farm: Sprout,
    truck: Truck,
    warehouse: Warehouse,
    users: Users
  };

  return (
    <div className="p-8 space-y-6">
      {/* Supply Chain Flow */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 backdrop-blur-sm">
        <h3 className="text-xl font-bold text-white mb-6">Supply Chain Flow</h3>
        
        {/* Flow Visualization */}
        <div className="flex items-center justify-between">
          {supplyChainStages.map((stage, index) => {
            const Icon = iconMap[stage.icon];
            const isWarehouse = stage.icon === 'warehouse';
            
            return (
              <div key={stage.id} className="flex items-center">
                {/* Stage Card */}
                <div className={`flex flex-col items-center ${isWarehouse ? 'p-6' : 'p-4'}`}>
                  <div className={`
                    ${isWarehouse ? 'bg-red-500/20 border-red-500/50' : stage.icon === 'farm' ? 'bg-green-500/20 border-green-500/50' : 'bg-blue-500/20 border-blue-500/50'}
                    border-2 rounded-full p-4 mb-3
                  `}>
                    <Icon className={`
                      ${isWarehouse ? 'text-red-400' : stage.icon === 'farm' ? 'text-green-400' : 'text-blue-400'}
                      w-8 h-8
                    `} />
                  </div>
                  <p className="text-white font-medium text-center text-sm">{stage.name}</p>
                  <p className="text-slate-400 text-xs text-center mt-1">{stage.subtitle}</p>
                </div>

                {/* Arrow between stages */}
                {index < supplyChainStages.length - 1 && (
                  <div className="flex items-center mx-4">
                    <div className="w-16 h-0.5 bg-slate-600"></div>
                    <div className="w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-l-8 border-l-slate-600"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Middle Section: Chart + Alert */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Price Volatility Chart */}
        <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700 rounded-xl p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">Price Volatility Chart</h3>
            <select className="bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 text-sm">
              <option>Last 30 Days</option>
            </select>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={priceVolatility}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis 
                dataKey="day" 
                stroke="#94a3b8"
                label={{ value: 'Last 30 Days', position: 'insideBottom', offset: -5, fill: '#94a3b8' }}
              />
              <YAxis 
                stroke="#94a3b8"
                label={{ value: 'Food Price Index', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={false}
              />
              {/* Highlight spike area */}
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke="#ef4444" 
                strokeWidth={3}
                dot={{ r: 4 }}
                data={priceVolatility.slice(-5)}
              />
            </LineChart>
          </ResponsiveContainer>

          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-red-400" />
            <p className="text-red-400 text-sm">
              <span className="font-semibold">Recent Spike: {priceSpike.value}</span> {priceSpike.reason}
            </p>
          </div>
        </div>

        {/* Spoilage Risk Alert */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 backdrop-blur-sm">
          <h3 className="text-xl font-bold text-white mb-4">Spoilage Risk Alert</h3>
          
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-white font-medium mb-2">
                  High Spoilage Risk for {spoilageRisk.product}
                </p>
                <p className="text-slate-400 text-sm">
                  {spoilageRisk.reason} = Risk Level: <span className="text-red-400 font-semibold">{spoilageRisk.riskLevel}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Market Inventory */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 backdrop-blur-sm">
        <h3 className="text-xl font-bold text-white mb-4">Market Inventory</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-700">
            <span className="text-slate-400">Wheat:</span>
            <span className={`font-semibold ${marketInventory.wheat?.color === 'green' ? 'text-green-400' : marketInventory.wheat?.color === 'yellow' ? 'text-yellow-400' : 'text-red-400'}`}>
              {marketInventory.wheat?.status || 'N/A'}
            </span>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-700">
            <span className="text-slate-400">Vegetables:</span>
            <span className={`font-semibold ${marketInventory.vegetables?.color === 'green' ? 'text-green-400' : marketInventory.vegetables?.color === 'yellow' ? 'text-yellow-400' : 'text-red-400'}`}>
              {marketInventory.vegetables?.status || 'N/A'}
            </span>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-700">
            <span className="text-slate-400">Fruits:</span>
            <span className={`font-semibold ${marketInventory.fruits?.color === 'green' ? 'text-green-400' : marketInventory.fruits?.color === 'yellow' ? 'text-yellow-400' : 'text-red-400'}`}>
              {marketInventory.fruits?.status || 'N/A'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Agriculture;
