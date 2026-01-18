/**
 * Correlation Service
 * Handles correlation-specific API calls and data transformations
 */

import {
  fetchCorrelationMatrix,
  fetchCorrelationInsights,
  fetchCorrelationImpact,
  triggerCorrelationAnalysis
} from './api';

/**
 * Get correlation matrix data formatted for visualization
 */
export const getCorrelationMatrixData = async (zoneId = null) => {
  try {
    const result = await fetchCorrelationMatrix(zoneId);
    
    if (result.error) {
      return { error: result.error };
    }
    
    const matrix = result.matrix || {};
    const domainNames = result.domain_names || [];
    
    // Convert matrix to array format for heatmap
    const matrixData = [];
    domainNames.forEach((row, i) => {
      domainNames.forEach((col, j) => {
        const value = matrix[row]?.[col] || 0;
        matrixData.push({
          row: row.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          col: col.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          value: value,
          absValue: Math.abs(value),
          rawRow: row,
          rawCol: col
        });
      });
    });
    
    return {
      matrixData,
      domainNames,
      dataPoints: result.data_points || 0,
      zoneId: result.zone_id || 'all'
    };
  } catch (error) {
    console.error('Error fetching correlation matrix:', error);
    return { error: error.message };
  }
};

/**
 * Get correlation insights formatted for display
 */
export const getCorrelationInsights = async (zoneId = null) => {
  try {
    const result = await fetchCorrelationInsights(zoneId);
    
    if (result.error) {
      return { error: result.error };
    }
    
    return {
      insights: result.insights || [],
      anomalies: result.anomalies || [],
      summary: result.summary || 'No insights available',
      zoneId: result.zone_id || 'all'
    };
  } catch (error) {
    console.error('Error fetching correlation insights:', error);
    return { error: error.message };
  }
};

/**
 * Get impact analysis between two domains
 */
export const getDomainImpact = async (sourceDomain, targetDomain, sourceChange = null) => {
  try {
    const result = await fetchCorrelationImpact(sourceDomain, targetDomain, sourceChange);
    
    if (result.error) {
      return { error: result.error };
    }
    
    return result;
  } catch (error) {
    console.error('Error fetching domain impact:', error);
    return { error: error.message };
  }
};

/**
 * Trigger correlation analysis and return formatted results
 */
export const analyzeCorrelations = async (zoneId = null) => {
  try {
    const result = await triggerCorrelationAnalysis(zoneId);
    return result;
  } catch (error) {
    console.error('Error triggering correlation analysis:', error);
    return { error: error.message };
  }
};
