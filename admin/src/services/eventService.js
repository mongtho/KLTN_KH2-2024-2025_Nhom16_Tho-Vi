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
      params.reason = reason;
      
      const response = await api.put(`/events/${eventId}/reject`, {}, { params });
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

  // Get registered users for an event (new)
  getRegisteredUsers: async (eventId, params = {}) => {
    try {
      
      const response = await api.get(`/events/${eventId}/registered-users`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  }
};

export default eventService; 