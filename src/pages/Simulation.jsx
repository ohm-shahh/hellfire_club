import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { SIMULATION_DEFAULTS, generateSimulationResult } from '../data/mockData';

const Simulation = () => {
  const [rainfall, setRainfall] = useState(SIMULATION_DEFAULTS.rainfallIncrease);
  const [mosquitoBudget, setMosquitoBudget] = useState(SIMULATION_DEFAULTS.mosquitoControlBudget);
  const [highwayClosed, setHighwayClosed] = useState(SIMULATION_DEFAULTS.highwayClosed);
  const [hasRun, setHasRun] = useState(false);

  const result = generateSimulationResult(rainfall, mosquitoBudget, highwayClosed);

  const handleRunSimulation = () => {
    setHasRun(true);
  };

  return (
    <div className="p-8 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scenario Controls */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 backdrop-blur-sm hover:shadow-lg hover:shadow-slate-500/10 transition-all duration-300">
          <h3 className="text-xl font-bold text-white mb-6">Scenario Controls</h3>
          
          <div className="space-y-6">
            {/* Rainfall Slider */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-slate-400">Increase Rainfall by (%)</label>
                <span className="text-green-400 font-semibold">+{rainfall}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="20"
                value={rainfall}
                onChange={(e) => setRainfall(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>0%</span>
                <span>5%</span>
                <span>10%</span>
                <span>15%</span>
                <span>+20%</span>
              </div>
            </div>

            {/* Mosquito Control Budget Slider */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-slate-400">Mosquito Control Budget (%)</label>
                <span className="text-red-400 font-semibold">{mosquitoBudget}%</span>
              </div>
              <input
                type="range"
                min="-10"
                max="100"
                value={mosquitoBudget}
                onChange={(e) => setMosquitoBudget(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>-10</span>
                <span>-25</span>
                <span>0</span>
                <span>75</span>
                <span>100</span>
              </div>
            </div>

            {/* Highway Toggle */}
            <div>
              <div className="flex justify-between items-center p-4 bg-slate-900/50 rounded-lg border border-slate-700 hover:border-slate-600 transition-all duration-300">
                <label className="text-slate-400">Close Main Highway</label>
                <button
                  onClick={() => setHighwayClosed(!highwayClosed)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
                    highwayClosed ? 'bg-blue-600' : 'bg-slate-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                      highwayClosed ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {highwayClosed ? 'On' : 'Off'}
              </p>
            </div>
          </div>

          {/* Run Simulation Button */}
          <button
            onClick={handleRunSimulation}
            className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/50 transform hover:scale-105"
          >
            Run Simulation
          </button>
        </div>

        {/* Predicted Impact & Outcome */}
        <div className="lg:col-span-2 space-y-6">
          {/* Result Description */}
          {hasRun && (
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 backdrop-blur-sm hover:shadow-lg hover:shadow-slate-500/10 transition-all duration-300 animate-fade-in">
              <h3 className="text-xl font-bold text-white mb-4">Predicted Impact & Outcome</h3>
              <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-600">
                <p className="text-slate-300">
                  <span className="font-semibold text-white">Simulation Result:</span> {result.description}
                </p>
              </div>
            </div>
          )}

          {/* Future Outcome Chart */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 backdrop-blur-sm hover:shadow-lg hover:shadow-slate-500/10 transition-all duration-300">
            <h3 className="text-xl font-bold text-white mb-4">Future Outcome Chart</h3>
            
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={result.timeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis 
                  dataKey="day" 
                  stroke="#94a3b8"
                />
                <YAxis 
                  stroke="#94a3b8"
                  label={{ value: 'Dengue Cases (Projected)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                  labelStyle={{ color: '#e2e8f0' }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="baseline" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Baseline"
                  dot={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="simulated" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Simulated Scenario"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Key Metrics Impact */}
          {hasRun && (
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 backdrop-blur-sm hover:shadow-lg hover:shadow-slate-500/10 transition-all duration-300 animate-fade-in">
              <h3 className="text-xl font-bold text-white mb-4">Key Metrics Impact</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">Traffic Congestion</th>
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">Prevention Change</th>
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">Scenario Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-700/50 hover:bg-slate-900/30 transition-all duration-300">
                      <td className="py-3 px-4 text-white">Food Prices</td>
                      <td className="py-3 px-4 text-green-400">{result.metrics.foodPrices.prevention}</td>
                      <td className="py-3 px-4 text-red-400">{result.metrics.foodPrices.scenario}</td>
                    </tr>
                    <tr className="border-b border-slate-700/50 hover:bg-slate-900/30 transition-all duration-300">
                      <td className="py-3 px-4 text-white">Hospital Load</td>
                      <td className="py-3 px-4 text-green-400">{result.metrics.hospitalLoad.prevention}</td>
                      <td className="py-3 px-4 text-red-400">{result.metrics.hospitalLoad.scenario}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Simulation;