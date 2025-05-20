import api from './api';

const facultyService = {
  // Get all faculties
  getAllFaculties: async () => {
    try {
      const response = await api.get('/faculties');
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get faculty by ID
  getFacultyById: async (facultyId) => {
    try {
      const response = await api.get(`/faculties/${facultyId}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Create new faculty
  createFaculty: async (facultyData) => {
    try {
      const response = await api.post('/faculties', facultyData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Update faculty
  updateFaculty: async (facultyId, facultyData) => {
    try {
      const response = await api.put(`/faculties/${facultyId}`, facultyData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Delete faculty
  deleteFaculty: async (facultyId) => {
    try {
      const response = await api.delete(`/faculties/${facultyId}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  }
};

export default facultyService; 