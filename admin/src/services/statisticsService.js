import api from './api';

const statisticsService = {
  // Get event statistics
  getEventStatistics: async (params = {}) => {
    try {
      const response = await api.get('/statistics/events', { params });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get user statistics
  getUserStatistics: async (params = {}) => {
    try {
      const response = await api.get('/statistics/users', { params });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get registration statistics
  getRegistrationStatistics: async (params = {}) => {
    try {
      const response = await api.get('/statistics/registrations', { params });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get dashboard summary
  getDashboardSummary: async () => {
    try {
      const response = await api.get('/statistics/dashboard');
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  getSummary: async () => {
    try {
      const response = await api.get('/statistics/summary');
      return response.data;
    } catch (error) {
      console.error("Error fetching statistics summary:", error);
      // Rethrow or handle error as needed for UI
      throw error.response ? error.response.data : error;
    }
  },
};

export default statisticsService; 