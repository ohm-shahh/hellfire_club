/**
 * City Context - Global state management for selected city
 * Allows all components to access and change the current city
 */

import { createContext, useContext, useState, useEffect } from 'react';
import { fetchDashboardData, fetchAvailableCities } from '../services/api';

const CityContext = createContext();

export const CityProvider = ({ children }) => {
  const [selectedCity, setSelectedCity] = useState('Ahmedabad');
  const [availableCities, setAvailableCities] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch available cities on mount
  useEffect(() => {
    const loadCities = async () => {
      try {
        const cities = await fetchAvailableCities();
        setAvailableCities(cities);
      } catch (err) {
        console.error('Failed to load cities:', err);
        setError('Failed to load cities');
      }
    };

    loadCities();
  }, []);

  // Fetch dashboard data whenever city changes
  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await fetchDashboardData(selectedCity);
        setDashboardData(data);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
        setError('Failed to load dashboard data. Make sure the API server is running.');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [selectedCity]);

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
    availableCities,
    dashboardData,
    loading,
    error,
    changeCity,
    refreshData
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
