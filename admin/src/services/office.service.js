import api from './api';

const API_PATH = '/offices'; // API path for offices

const getAllOffices = () => {
  return api.get(API_PATH);
};

const getOfficeById = (id) => {
  return api.get(`${API_PATH}/${id}`);
};

const createOffice = (officeData) => {
  return api.post(API_PATH, officeData);
};

const updateOffice = (id, officeData) => {
  return api.put(`${API_PATH}/${id}`, officeData);
};

const deleteOffice = (id) => {
  return api.delete(`${API_PATH}/${id}`);
};

const officeService = {
  getAllOffices,
  getOfficeById,
  createOffice,
  updateOffice,
  deleteOffice,
};

export default officeService; 