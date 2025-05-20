import api from './api';

const API_PATH = '/event-reports';

const getAllReports = async () => {
  try {
    const response = await api.get(API_PATH);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const getReportById = async (id) => {
  try {
    const response = await api.get(`${API_PATH}/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const getReportsByEventId = (eventId) => {
  return api.get(`${API_PATH}/event/${eventId}`);
};

const createReport = async (reportData) => {
  try {
    // Handle file uploads if present
    if (reportData.attachments && reportData.attachments.length > 0) {
      const formData = new FormData();
      reportData.attachments.forEach(file => {
        formData.append('files', file);
      });
      
      // Upload files first
      const uploadResponse = await api.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Update reportData with file names from response
      reportData.attachments = uploadResponse.data;
    }

    const response = await api.post(API_PATH, reportData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const updateReport = async (id, reportData) => {
  try {
    // Handle file uploads for new attachments
    if (reportData.newAttachments && reportData.newAttachments.length > 0) {
      const formData = new FormData();
      reportData.newAttachments.forEach(file => {
        formData.append('files', file);
      });
      
      const uploadResponse = await api.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Merge new attachments with existing ones
      reportData.attachments = [
        ...(reportData.attachments || []),
        ...uploadResponse.data
      ];
    }

    const response = await api.put(`${API_PATH}/${id}`, reportData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const deleteReport = async (id) => {
  try {
    const response = await api.delete(`${API_PATH}/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const approveReport = async (id, userId) => {
  try {
    // Send userId as a query parameter
    const response = await api.post(`${API_PATH}/${id}/approve`, null, {
      params: { userId }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

const rejectReport = async (id, reasonValue, userIdValue) => {
  try {
    const response = await api.post(`${API_PATH}/${id}/reject`, null, {
      params: { 
        reason: reasonValue,
        userId: userIdValue
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

const requestRevision = async (id, reasonValue, userIdValue) => {
  try {
    const response = await api.post(`${API_PATH}/${id}/request-revision`, null, {
      params: { 
        reason: reasonValue,
        userId: userIdValue
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

const downloadAttachment = async (fileName) => {
  try {
    const response = await api.get(`/files/download/${fileName}`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

const deleteAttachment = async (fileName) => {
  try {
    const response = await api.delete(`/files/${fileName}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const eventReportService = {
  getAllReports,
  getReportById,
  getReportsByEventId,
  createReport,
  updateReport,
  deleteReport,
  approveReport,
  rejectReport,
  requestRevision,
  downloadAttachment,
  deleteAttachment,
};

export default eventReportService; 