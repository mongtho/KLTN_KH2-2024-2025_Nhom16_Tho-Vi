import axios from 'axios';
import authHeader from './auth-header';

const API_URL = 'http://localhost:8080/api/event-reports';

class EventReportService {
  async getAllReports() {
    return axios.get(API_URL, { headers: authHeader() });
  }

  async getReportById(id) {
    return axios.get(`${API_URL}/${id}`, { headers: authHeader() });
  }

  async createReport(reportData) {
    return axios.post(API_URL, reportData, { headers: authHeader() });
  }

  async updateReport(id, reportData) {
    return axios.put(`${API_URL}/${id}`, reportData, { headers: authHeader() });
  }

  async deleteReport(id) {
    return axios.delete(`${API_URL}/${id}`, { headers: authHeader() });
  }

  async approveReport(id, userId) {
    return axios.post(`${API_URL}/${id}/approve?userId=${userId}`, {}, { headers: authHeader() });
  }

  async rejectReport(id, reason, userId) {
    return axios.post(`${API_URL}/${id}/reject?reason=${reason}&userId=${userId}`, {}, { headers: authHeader() });
  }

  async getReportsByEventId(eventId) {
    return axios.get(`${API_URL}/event/${eventId}`, { headers: authHeader() });
  }
}

export default new EventReportService(); 