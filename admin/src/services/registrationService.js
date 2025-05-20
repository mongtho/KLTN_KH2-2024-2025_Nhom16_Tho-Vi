import api from './api';

const registrationService = {
  // Get all registrations (admin only)
  getAllRegistrations: async (params = {}) => {
    try {
      const response = await api.get('/registrations', { params });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get registration by ID
  getRegistrationById: async (registrationId) => {
    try {
      const response = await api.get(`/registrations/${registrationId}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get user registrations
  getUserRegistrations: async (params = {}) => {
    try {
      const response = await api.get('/registrations/user', { params });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Register for an event
  registerForEvent: async (eventId, registrationData = {}) => {
    try {
      const response = await api.post(`/events/${eventId}/register`, registrationData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Cancel registration
  cancelRegistration: async (registrationId, reason = '') => {
    try {
      const response = await api.put(`/registrations/${registrationId}/cancel`, { reason });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Check in attendee
  checkInAttendee: async (eventId, registrationId) => {
    try {
      const response = await api.put(`/events/${eventId}/registrations/${registrationId}/check-in`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get attendance list for event
  getEventAttendance: async (eventId, params = {}) => {
    try {
      const response = await api.get(`/events/${eventId}/attendance`, { params });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Export attendance list (returns URL to download)
  exportAttendanceList: async (eventId, format = 'csv') => {
    try {
      const response = await api.get(`/events/${eventId}/export-attendance`, { 
        params: { format },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  }
};

export default registrationService; 