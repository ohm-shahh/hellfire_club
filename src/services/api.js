/**
 * Smart City Dashboard API Service
 * Handles all API calls to the Python FastAPI backend
 */

const API_BASE_URL = 'http://localhost:8000';

/**
 * Fetch complete dashboard data for a city
 * @param {string} cityName - Name of the city (e.g., "Ahmedabad", "Bangalore")
 * @returns {Promise<Object>} Complete dashboard data
 */
export const fetchDashboardData = async (cityName = 'Ahmedabad') => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/dashboard?city=${cityName}`);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
};

/**
 * Fetch list of available cities
 * @returns {Promise<Array>} Array of city names
 */
export const fetchAvailableCities = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/cities`);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.cities;
  } catch (error) {
    console.error('Error fetching cities:', error);
    throw error;
  }
};

/**
 * Fetch overview statistics only
 * @param {string} cityName - Name of the city
 * @returns {Promise<Object>} Overview data
 */
export const fetchOverviewData = async (cityName = 'Ahmedabad') => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/overview?city=${cityName}`);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching overview data:', error);
    throw error;
  }
};

/**
 * Fetch traffic data only
 * @param {string} cityName - Name of the city
 * @returns {Promise<Object>} Traffic data
 */
export const fetchTrafficData = async (cityName = 'Ahmedabad') => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/traffic?city=${cityName}`);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching traffic data:', error);
    throw error;
  }
};

/**
 * Fetch health data only
 * @param {string} cityName - Name of the city
 * @returns {Promise<Object>} Health data
 */
export const fetchHealthData = async (cityName = 'Ahmedabad') => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health?city=${cityName}`);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching health data:', error);
    throw error;
  }
};

/**
 * Fetch agriculture data only
 * @param {string} cityName - Name of the city
 * @returns {Promise<Object>} Agriculture data
 */
export const fetchAgricultureData = async (cityName = 'Ahmedabad') => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/agriculture?city=${cityName}`);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching agriculture data:', error);
    throw error;
  }
};

/**
 * Check if API is healthy/running
 * @returns {Promise<boolean>} True if API is running
 */
export const checkAPIHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
};
