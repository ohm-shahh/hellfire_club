/**
 * City Context - Global state management for selected city
 * Allows all components to access and change the current city
 */

import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { fetchDashboardData, fetchZones, fetchRealtimeDashboard } from '../services/api';

const CityContext = createContext();

export const CityProvider = ({ children }) => {
  const [selectedCity, setSelectedCity] = useState('Ahmedabad');
  const [availableZones, setAvailableZones] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const pollingIntervalRef = useRef(null);
  const POLLING_INTERVAL = 10000; // 10 seconds

  // Fetch available zones on mount
  useEffect(() => {
    const loadZones = async () => {
      try {
        const result = await fetchZones();
        setAvailableZones(result.zones || []);
      } catch (err) {
        console.error('Failed to load zones:', err);
        // Don't set error for zones, continue anyway
      }
    };

    loadZones();
  }, []);

  // Fetch dashboard data with real-time polling
  useEffect(() => {
    const loadDashboardData = async (isInitial = false) => {
      if (isInitial) {
        setLoading(true);
        setError(null);
      }
      
      try {
        const data = await fetchDashboardData();
        setDashboardData(data);
        if (isInitial) {
          setError(null);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
        if (isInitial) {
          setError('Failed to load dashboard data. Make sure the API server is running at http://localhost:2000');
        }
      } finally {
        if (isInitial) {
          setLoading(false);
        }
      }
    };

    // Initial load
    loadDashboardData(true);

    // Set up polling interval
    pollingIntervalRef.current = setInterval(() => {
      loadDashboardData(false);
    }, POLLING_INTERVAL);

    // Cleanup on unmount or city change
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [selectedCity]); // Re-fetch when city changes

  const changeCity = (cityName) => {
    setSelectedCity(cityName);
  };

  const refreshData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchDashboardData(selectedCity);
      setDashboardData(data);
    } catch (err) {
      console.error('Failed to refresh data:', err);
      setError('Failed to refresh data');
    } finally {
      setLoading(false);
    }
  };

  const value = {
    selectedCity,
    availableCities: availableZones, // For backwards compatibility
    availableZones,
    dashboardData,
    loading,
    error,
    changeCity: setSelectedCity,
    refreshData: async () => {
      setLoading(true);
      try {
        const data = await fetchDashboardData();
        setDashboardData(data);
        setError(null);
      } catch (err) {
        console.error('Failed to refresh data:', err);
        setError('Failed to refresh data');
      } finally {
        setLoading(false);
      }
    }
  };

  return <CityContext.Provider value={value}>{children}</CityContext.Provider>;
};

// Custom hook to use city context
export const useCity = () => {
  const context = useContext(CityContext);
  if (!context) {
    throw new Error('useCity must be used within a CityProvider');
  }
  return context;
};
