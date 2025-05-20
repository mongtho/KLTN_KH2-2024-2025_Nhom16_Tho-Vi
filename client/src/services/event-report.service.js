import api from './api';

const API_PATH = '/event-reports';

const getAllReports = () => {
  return api.get(API_PATH);
};

const getReportById = (id) => {
  return api.get(`${API_PATH}/${id}`);
};

const getReportsByEventId = (eventId) => {
  return api.get(`${API_PATH}/event/${eventId}`);
};

const createReport = (reportData) => {
  return api.post(API_PATH, reportData);
};

const updateReport = (id, reportData) => {
  return api.put(`${API_PATH}/${id}`, reportData);
};

const deleteReport = (id) => {
  return api.delete(`${API_PATH}/${id}`);
};

const approveReport = (id, userId) => {
  return api.post(`${API_PATH}/${id}/approve`, null, { params: { userId } });
};

const rejectReport = (id, reasonValue, userIdValue) => {
  return api.post(`${API_PATH}/${id}/reject`, null, {
    params: {
      reason: reasonValue,
      userId: userIdValue
    }
  });
};

const requestRevision = (id, reasonValue, userIdValue) => {
  return api.post(`${API_PATH}/${id}/request-revision`, null, {
    params: {
      reason: reasonValue,
      userId: userIdValue
    }
  });
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
};

export default eventReportService; 