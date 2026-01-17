/**
 * City Selector Component
 * Dropdown to switch between different cities
 */

import { MapPin, RefreshCw } from 'lucide-react';
import { useCity } from '../../context/CityContext';

const CitySelector = () => {
  const { selectedCity, availableCities, changeCity, loading, refreshData } = useCity();

  return (
    <div className="flex items-center space-x-3">
      {/* City Dropdown */}
      <div className="relative">
        <select
          value={selectedCity}
          onChange={(e) => changeCity(e.target.value)}
          disabled={loading}
          className="appearance-none bg-slate-800 text-white pl-10 pr-10 py-2 rounded-lg border border-slate-700 hover:border-blue-500 focus:outline-none focus:border-blue-500 transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {availableCities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
        
        {/* Map Pin Icon */}
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-400 pointer-events-none" />
        
        {/* Dropdown Arrow */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Refresh Button */}
      <button
        onClick={refreshData}
        disabled={loading}
        className="bg-slate-800 text-white p-2 rounded-lg border border-slate-700 hover:border-blue-500 hover:bg-slate-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Refresh data"
      >
        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
      </button>

      {/* Loading Indicator */}
      {loading && (
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
          <span className="text-sm text-slate-400">Loading...</span>
        </div>
      )}
    </div>
  );
};

export default CitySelector;
