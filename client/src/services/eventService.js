import api from './api';
import { authService } from './index';

const eventService = {
  // Get all events with filtering options
  getAllEvents: async (params = {}) => {
    try {
      const currentUser = authService.getCurrentUser();
      if (currentUser && currentUser.id) {
        params.userId = currentUser.id;
        params.role = currentUser.role;
      }
      const response = await api.get('/events', { params });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get event by ID
  getEventById: async (eventId) => {
    try {
      const response = await api.get(`/events/${eventId}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Create new event
  createEvent: async (eventData) => {
    try {
      // Ensure userId is included in the request
      const currentUser = authService.getCurrentUser();
      if (currentUser && currentUser.id && !eventData.userId) {
        eventData.userId = currentUser.id;
      }
      
      const response = await api.post('/events', eventData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Update event
  updateEvent: async (eventId, eventData) => {
    try {
      // Ensure userId is included in the request
      const currentUser = authService.getCurrentUser();
      if (currentUser && currentUser.id && !eventData.userId) {
        eventData.userId = currentUser.id;
      }
      
      // Add role as a query parameter
      const params = {};
      if (currentUser && currentUser.role) {
        params.role = currentUser.role;
      }
      
      const response = await api.put(`/events/${eventId}`, eventData, { params });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Delete event
  deleteEvent: async (eventId) => {
    try {
      const currentUser = authService.getCurrentUser();
      const params = {};
      
      if (currentUser) {
        params.userId = currentUser.id;
        params.role = currentUser.role;
      }
      
      const response = await api.delete(`/events/${eventId}`, { params });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Approve event
  approveEvent: async (eventId) => {
    try {
      const currentUser = authService.getCurrentUser();
      const params = {};
      
      if (currentUser) {
        params.userId = currentUser.id;
        params.role = currentUser.role;
      }
      
      const response = await api.put(`/events/${eventId}/approve`, {}, { params });
      return response;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Reject event
  rejectEvent: async (eventId, reason) => {
    try {
      const currentUser = authService.getCurrentUser();
      const params = {};
      
      if (currentUser) {
        params.userId = currentUser.id;
        params.role = currentUser.role;
      }
      
      const response = await api.put(`/events/${eventId}/reject`, { reason }, { params });
      return response;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Cancel event
  cancelEvent: async (eventId, reason) => {
    try {
      const currentUser = authService.getCurrentUser();
      const params = {};
      
      if (currentUser) {
        params.userId = currentUser.id;
        params.role = currentUser.role;
      }
      
      const response = await api.put(`/events/${eventId}/cancel`, { reason }, { params });
      return response;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get event registrations
  getEventRegistrations: async (eventId, params = {}) => {
    try {
      const currentUser = authService.getCurrentUser();
      
      if (currentUser) {
        params.userId = currentUser.id;
        params.role = currentUser.role;
      }
      
      const response = await api.get(`/events/${eventId}/registrations`, { params });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
  
  // Register user for event
  registerForEvent: async (eventId) => {
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser || !currentUser.id) {
        throw new Error('User must be logged in to register for an event');
      }
      
      const params = { userId: currentUser.id };
      const response = await api.post(`/events/${eventId}/register`, null, { params });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
  
  // Check if user is registered for event
  checkRegistrationStatus: async (eventId) => {
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser || !currentUser.id) {
        return false; // Not registered if not logged in
      }
      
      const params = { userId: currentUser.id };
      const response = await api.get(`/events/${eventId}/is-registered`, { params });
      return response.data;
    } catch (error) {
      console.error('Error checking registration status:', error);
      return false; // Assume not registered on error
    }
  },
  
  // Cancel registration for event
  cancelRegistration: async (eventId) => {
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser || !currentUser.id) {
        throw new Error('User must be logged in to cancel registration');
      }
      
      const params = { userId: currentUser.id };
      const response = await api.delete(`/events/${eventId}/register`, { params });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  }
};

export default eventService; 