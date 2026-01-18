import { useState, useEffect } from 'react';
import { Link2, TrendingUp, AlertTriangle, RefreshCw } from 'lucide-react';
import { getCorrelationMatrixData, getCorrelationInsights, getDomainImpact } from '../services/correlationService';
import { fetchZones } from '../services/api';

const Correlations = () => {
  const [zoneId, setZoneId] = useState(null);
  const [zones, setZones] = useState([]);
  const [matrixData, setMatrixData] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPair, setSelectedPair] = useState(null);
  const [impactData, setImpactData] = useState(null);

  useEffect(() => {
    loadZones();
  }, []);

  useEffect(() => {
    loadData();
  }, [zoneId]);

  const loadZones = async () => {
    try {
      const result = await fetchZones();
      setZones(result.zones || []);
    } catch (err) {
      console.error('Error loading zones:', err);
    }
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [matrixResult, insightsResult] = await Promise.all([
        getCorrelationMatrixData(zoneId),
        getCorrelationInsights(zoneId)
      ]);

      if (matrixResult.error) {
        setError(matrixResult.error);
      } else {
        setMatrixData(matrixResult);
      }

      if (insightsResult.error) {
        setError(insightsResult.error);
      } else {
        setInsights(insightsResult);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMatrixCellClick = async (row, col, rawRow, rawCol) => {
    setSelectedPair({ source: rawRow, target: rawCol });
    
    try {
      const impact = await getDomainImpact(rawRow, rawCol);
      setImpactData(impact);
    } catch (err) {
      console.error('Error fetching impact:', err);
    }
  };

  const getCorrelationColor = (value) => {
    const absValue = Math.abs(value);
    if (absValue > 0.7) return 'bg-red-600';
    if (absValue > 0.4) return 'bg-orange-500';
    if (absValue > 0.2) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getCorrelationStrength = (value) => {
    const absValue = Math.abs(value);
    if (absValue > 0.7) return 'Strong';
    if (absValue > 0.4) return 'Moderate';
    if (absValue > 0.2) return 'Weak';
    return 'Very Weak';
  };

  if (loading && !matrixData) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading correlation analysis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Cross-Domain Correlations</h1>
          <p className="text-slate-400">Analyze relationships between traffic, weather, health, and agriculture</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={zoneId || ''}
            onChange={(e) => setZoneId(e.target.value || null)}
            className="px-4 py-2 bg-slate-800 text-white rounded-lg border border-slate-700 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Zones</option>
            {zones.map((zone) => (
              <option key={zone.zone_id} value={zone.zone_id}>
                {zone.zone_id} - {zone.name}
              </option>
            ))}
          </select>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-all flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 text-red-400">
          <AlertTriangle className="w-5 h-5 inline-block mr-2" />
          {error}
        </div>
      )}

      {/* Correlation Matrix Heatmap */}
      {matrixData && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 backdrop-blur-sm">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <Link2 className="w-5 h-5 mr-2" />
            Correlation Matrix
          </h2>
          {matrixData.error ? (
            <p className="text-slate-400">{matrixData.error}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-slate-400"></th>
                    {matrixData.domainNames.map((domain) => (
                      <th key={domain} className="px-4 py-2 text-center text-slate-400 text-xs">
                        {domain.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {matrixData.domainNames.map((row, i) => (
                    <tr key={row}>
                      <td className="px-4 py-2 text-slate-300 text-xs">
                        {row.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </td>
                      {matrixData.domainNames.map((col, j) => {
                        const cellData = matrixData.matrixData.find(
                          d => d.rawRow === row && d.rawCol === col
                        );
                        const value = cellData?.value || 0;
                        const isDiagonal = i === j;
                        
                        return (
                          <td
                            key={col}
                            onClick={() => !isDiagonal && handleMatrixCellClick(row, col, row, col)}
                            className={`px-2 py-2 text-center ${
                              isDiagonal
                                ? 'bg-slate-700/50 cursor-default'
                                : `${getCorrelationColor(value)} cursor-pointer hover:opacity-80 transition-opacity`
                            }`}
                            title={!isDiagonal ? `Click to analyze impact: ${value.toFixed(3)}` : 'Self-correlation'}
                          >
                            <span className="text-white font-medium text-xs">
                              {value.toFixed(2)}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                <span>Data points: {matrixData.dataPoints}</span>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-red-600"></div>
                    <span>Strong (&gt;0.7)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-orange-500"></div>
                    <span>Moderate (0.4-0.7)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-yellow-500"></div>
                    <span>Weak (0.2-0.4)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-green-500"></div>
                    <span>Very Weak (&lt;0.2)</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Impact Analysis */}
      {selectedPair && impactData && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 backdrop-blur-sm">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Impact Analysis: {selectedPair.source.replace(/_/g, ' ')} → {selectedPair.target.replace(/_/g, ' ')}
          </h2>
          {impactData.error ? (
            <p className="text-slate-400">{impactData.error}</p>
          ) : (
            <div className="space-y-4">
              {impactData.lag_correlations && (
                <div>
                  <h3 className="text-white font-semibold mb-2">Time-Lagged Correlations</h3>
                  <div className="bg-slate-900/50 rounded-lg p-4">
                    <div className="grid grid-cols-4 gap-4 text-xs text-slate-400 mb-2">
                      <div>Lag (hours)</div>
                      <div>Correlation</div>
                      <div>P-Value</div>
                      <div>Data Points</div>
                    </div>
                    {impactData.lag_correlations.slice(0, 10).map((lag, idx) => (
                      <div key={idx} className="grid grid-cols-4 gap-4 py-2 border-b border-slate-700">
                        <div className="text-white">{lag.lag_hours}</div>
                        <div className={`${lag.correlation > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {lag.correlation.toFixed(3)}
                        </div>
                        <div className="text-slate-400">{lag.p_value.toFixed(3)}</div>
                        <div className="text-slate-400">{lag.data_points}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {impactData.interpretation && (
                <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4">
                  <p className="text-blue-300">{impactData.interpretation}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Insights and Anomalies */}
      {insights && !insights.error && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Key Insights */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 backdrop-blur-sm">
            <h2 className="text-xl font-bold text-white mb-4">Key Insights</h2>
            {insights.insights.length === 0 ? (
              <p className="text-slate-400">No significant correlations found yet. Check back after more data is collected.</p>
            ) : (
              <div className="space-y-4">
                {insights.insights.map((insight, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border ${
                      insight.strength === 'strong'
                        ? 'bg-red-500/20 border-red-500/50'
                        : 'bg-orange-500/20 border-orange-500/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-white">{insight.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded ${
                        insight.strength === 'strong' ? 'bg-red-500/50' : 'bg-orange-500/50'
                      } text-white`}>
                        {getCorrelationStrength(insight.correlation)}
                      </span>
                    </div>
                    <p className="text-slate-300 text-sm mb-2">{insight.description}</p>
                    <div className="text-xs text-slate-400">
                      Correlation: {insight.correlation.toFixed(3)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Anomalies */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 backdrop-blur-sm">
            <h2 className="text-xl font-bold text-white mb-4">Detected Anomalies</h2>
            {insights.anomalies.length === 0 ? (
              <p className="text-slate-400">No anomalies detected. All correlations are within expected ranges.</p>
            ) : (
              <div className="space-y-3">
                {insights.anomalies.map((anomaly, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border ${
                      anomaly.type === 'positive_anomaly'
                        ? 'bg-green-500/20 border-green-500/50'
                        : 'bg-yellow-500/20 border-yellow-500/50'
                    }`}
                  >
                    <h3 className="font-semibold text-white mb-1">{anomaly.description}</h3>
                    <p className="text-slate-300 text-sm">{anomaly.interpretation}</p>
                    {anomaly.zone_id && (
                      <div className="text-xs text-slate-400 mt-2">Zone: {anomaly.zone_id}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Correlations;
