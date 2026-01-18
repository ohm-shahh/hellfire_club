import { useState, useEffect } from 'react';
import { 
  AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell
} from 'recharts';
import { 
  Sprout, Truck, Warehouse, Users, TrendingUp, TrendingDown, AlertTriangle,
  Droplets, Thermometer, Wind, Sun, Leaf, Package, DollarSign, Activity,
  AlertCircle, CheckCircle, Clock, MapPin
} from 'lucide-react';
import { useCity } from '../context/CityContext';
import { fetchAgricultureData } from '../services/api';

const Agriculture = () => {
  const { loading: contextLoading, error: contextError } = useCity();
  const [agriData, setAgriData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadAgriData = async () => {
      try {
        setLoading(true);
        const data = await fetchAgricultureData();
        setAgriData(data);
        setError(null);
      } catch (err) {
        console.error('Error loading agriculture data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadAgriData();
    const interval = setInterval(loadAgriData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Loading state
  if (loading || contextLoading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading agriculture data...</p>
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

  if (!agriData) return null;

  // Extract data
  const crops = agriData.crops || [];
  const priceTrends = agriData.price_trends || [];
  const priceVolatility = agriData.price_volatility || [];
  const supplyChain = agriData.supply_chain || [];
  const marketInventory = agriData.market_inventory || [];
  const weatherImpact = agriData.weather_impact || {};
  const spoilageAlerts = agriData.spoilage_alerts || [];
  const farmerStats = agriData.farmer_stats || {};
  const summary = agriData.summary || {};

  // Chart colors
  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-xl">
          <p className="text-slate-300 text-sm mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm font-medium" style={{ color: entry.color }}>
              {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      'Surplus': { bg: 'bg-green-500', text: 'text-green-400', light: 'bg-green-500/20' },
      'Adequate': { bg: 'bg-blue-500', text: 'text-blue-400', light: 'bg-blue-500/20' },
      'Low': { bg: 'bg-yellow-500', text: 'text-yellow-400', light: 'bg-yellow-500/20' },
      'Critical': { bg: 'bg-red-500', text: 'text-red-400', light: 'bg-red-500/20' }
    };
    return colors[status] || colors['Adequate'];
  };

  // Get risk color
  const getRiskColor = (level) => {
    const colors = {
      'Critical': 'bg-red-500/20 text-red-400 border-red-500/30',
      'High': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      'Medium': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'Low': 'bg-green-500/20 text-green-400 border-green-500/30'
    };
    return colors[level] || colors['Medium'];
  };

  return (
    <div className="p-8 space-y-6">
      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 border border-green-500/30 rounded-xl p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Crop Health Index</p>
              <p className="text-3xl font-bold text-white mt-1">
                {crops.length > 0 ? Math.round(crops.reduce((a, c) => a + c.health, 0) / crops.length) : 0}%
              </p>
              <p className="text-green-400 text-xs mt-1">{summary.healthycrops || 0}/{summary.totalCrops || 0} crops healthy</p>
            </div>
            <div className="w-14 h-14 bg-green-500/20 rounded-full flex items-center justify-center">
              <Leaf className="w-7 h-7 text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500/20 to-cyan-600/20 border border-blue-500/30 rounded-xl p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Price Index</p>
              <p className="text-3xl font-bold text-white mt-1">{summary.price_index || 100}</p>
              <p className="text-blue-400 text-xs mt-1">Market stability</p>
            </div>
            <div className="w-14 h-14 bg-blue-500/20 rounded-full flex items-center justify-center">
              <DollarSign className="w-7 h-7 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500/20 to-amber-600/20 border border-orange-500/30 rounded-xl p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Food Stress Index</p>
              <p className="text-3xl font-bold text-white mt-1">{summary.food_stress || 0}%</p>
              <p className="text-orange-400 text-xs mt-1">{summary.food_stress < 30 ? 'Low risk' : summary.food_stress < 60 ? 'Moderate' : 'High risk'}</p>
            </div>
            <div className="w-14 h-14 bg-orange-500/20 rounded-full flex items-center justify-center">
              <Activity className="w-7 h-7 text-orange-400" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500/20 to-violet-600/20 border border-purple-500/30 rounded-xl p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Registered Farmers</p>
              <p className="text-3xl font-bold text-white mt-1">{(farmerStats.totalFarmers / 1000).toFixed(1)}K</p>
              <p className="text-purple-400 text-xs mt-1">{farmerStats.activeLoans?.toLocaleString() || 0} active loans</p>
            </div>
            <div className="w-14 h-14 bg-purple-500/20 rounded-full flex items-center justify-center">
              <Users className="w-7 h-7 text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Crop Health & Weather Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Crop Health Chart */}
        <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700 rounded-xl p-6 backdrop-blur-sm">
          <h3 className="text-xl font-bold text-white mb-4">Crop Health & Yield Forecast</h3>
          
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={crops} barGap={12}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: '10px' }}
                formatter={(value) => <span className="text-slate-300 text-sm">{value}</span>}
              />
              <Bar dataKey="health" fill="#10b981" radius={[4, 4, 0, 0]} name="Health %" />
              <Bar dataKey="yield_forecast" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Yield Forecast %" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Weather Impact */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 backdrop-blur-sm">
          <h3 className="text-xl font-bold text-white mb-4">Weather Conditions</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Droplets className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Rainfall</p>
                  <p className="text-white font-medium">{weatherImpact.rainfall} mm</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                  <Thermometer className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Temperature</p>
                  <p className="text-white font-medium">{weatherImpact.temperature}°C</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                  <Wind className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Humidity</p>
                  <p className="text-white font-medium">{weatherImpact.humidity}%</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                  <Sun className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Soil Moisture</p>
                  <p className="text-white font-medium">{weatherImpact.soilMoisture}%</p>
                </div>
              </div>
            </div>

            <div className={`p-3 rounded-lg border ${
              weatherImpact.forecast === 'Favorable' ? 'bg-green-500/10 border-green-500/30' :
              weatherImpact.forecast === 'Moderate' ? 'bg-yellow-500/10 border-yellow-500/30' :
              'bg-red-500/10 border-red-500/30'
            }`}>
              <p className="text-slate-400 text-xs mb-1">Weather Outlook</p>
              <p className={`font-medium ${
                weatherImpact.forecast === 'Favorable' ? 'text-green-400' :
                weatherImpact.forecast === 'Moderate' ? 'text-yellow-400' : 'text-red-400'
              }`}>{weatherImpact.forecast}</p>
              <p className="text-slate-500 text-xs mt-1">{weatherImpact.alerts}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Price Volatility & Supply Chain */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Price Volatility */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">Price Volatility (30 Days)</h3>
            <div className="flex items-center space-x-2 text-xs">
              <span className="flex items-center"><span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>Wheat</span>
              <span className="flex items-center"><span className="w-2 h-2 bg-blue-500 rounded-full mr-1"></span>Rice</span>
              <span className="flex items-center"><span className="w-2 h-2 bg-orange-500 rounded-full mr-1"></span>Vegetables</span>
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={priceVolatility}>
              <defs>
                <linearGradient id="wheatGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="riceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="vegGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="day" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 10 }} interval={4} />
              <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="wheat" stroke="#10b981" fill="url(#wheatGradient)" strokeWidth={2} name="Wheat (₹/kg)" />
              <Area type="monotone" dataKey="rice" stroke="#3b82f6" fill="url(#riceGradient)" strokeWidth={2} name="Rice (₹/kg)" />
              <Area type="monotone" dataKey="vegetables" stroke="#f97316" fill="url(#vegGradient)" strokeWidth={2} name="Vegetables (₹/kg)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Supply Chain Status */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 backdrop-blur-sm">
          <h3 className="text-xl font-bold text-white mb-4">Supply Chain Status</h3>
          
          <div className="space-y-4">
            {supplyChain.map((item, idx) => {
              const icons = [Truck, Warehouse, Package];
              const Icon = icons[idx % 3];
              const value = item.efficiency || item.capacity || item.onTime;
              const isHealthy = value > 80;
              
              return (
                <div key={idx} className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isHealthy ? 'bg-green-500/20' : 'bg-yellow-500/20'}`}>
                        <Icon className={`w-5 h-5 ${isHealthy ? 'text-green-400' : 'text-yellow-400'}`} />
                      </div>
                      <div>
                        <p className="text-white font-medium">{item.route}</p>
                        <p className="text-slate-500 text-xs">{item.status}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded text-sm font-medium ${isHealthy ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                      {value}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${isHealthy ? 'bg-green-500' : 'bg-yellow-500'}`}
                      style={{ width: `${value}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Farmer Support Stats */}
          <div className="mt-4 p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg">
            <h4 className="text-white font-medium mb-3">Farmer Support</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-slate-400">Subsidies</p>
                <p className="text-green-400 font-medium">{farmerStats.subsidiesDistributed}</p>
              </div>
              <div>
                <p className="text-slate-400">MSP Procurement</p>
                <p className="text-green-400 font-medium">{farmerStats.mspProcurement}</p>
              </div>
              <div>
                <p className="text-slate-400">Crop Insurance</p>
                <p className="text-green-400 font-medium">{farmerStats.cropInsuranceCoverage}</p>
              </div>
              <div>
                <p className="text-slate-400">Active Loans</p>
                <p className="text-green-400 font-medium">{farmerStats.activeLoans?.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Market Inventory & Spoilage Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Market Inventory */}
        <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700 rounded-xl p-6 backdrop-blur-sm">
          <h3 className="text-xl font-bold text-white mb-4">Market Inventory</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {marketInventory.map((item, idx) => {
              const statusColor = getStatusColor(item.status);
              const isPositive = item.priceChange > 0;
              
              return (
                <div key={idx} className="p-4 bg-slate-900/50 rounded-lg border border-slate-700 hover:border-slate-600 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">{item.name}</span>
                    <span className={`px-2 py-0.5 rounded text-xs ${statusColor.light} ${statusColor.text}`}>
                      {item.status}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-white">{item.stock.toLocaleString()}</p>
                  <p className="text-slate-500 text-xs">{item.unit}</p>
                  <div className="flex items-center mt-2">
                    {isPositive ? (
                      <TrendingUp className="w-4 h-4 text-red-400 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-green-400 mr-1" />
                    )}
                    <span className={`text-sm ${isPositive ? 'text-red-400' : 'text-green-400'}`}>
                      {isPositive ? '+' : ''}{item.priceChange}% price
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Spoilage Alerts */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">Spoilage Alerts</h3>
            <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-medium">
              {spoilageAlerts.length} Active
            </span>
          </div>
          
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
            {spoilageAlerts.map((alert, idx) => (
              <div key={idx} className={`p-3 rounded-lg border ${getRiskColor(alert.riskLevel)} transition-all hover:scale-[1.02]`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="font-medium text-white text-sm">{alert.product}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-xs ${getRiskColor(alert.riskLevel)}`}>
                    {alert.riskLevel}
                  </span>
                </div>
                <p className="text-slate-400 text-xs mb-1">{alert.reason}</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 flex items-center">
                    <MapPin className="w-3 h-3 mr-1" />{alert.location}
                  </span>
                  <span className="text-red-400">Est. Loss: {alert.estimatedLoss}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Price Trends Chart */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 backdrop-blur-sm">
        <h3 className="text-xl font-bold text-white mb-4">Weekly Price Trends (₹/kg)</h3>
        
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={priceTrends}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="day" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(v) => `Day ${v}`} />
            <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: '10px' }}
              formatter={(value) => <span className="text-slate-300 text-sm">{value}</span>}
            />
            <Line type="monotone" dataKey="Wheat" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="Rice" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="Vegetables" stroke="#f97316" strokeWidth={2} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="Pulses" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="Milk" stroke="#06b6d4" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Agriculture;
