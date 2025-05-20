import api from './api'; // Import the configured api instance

const API_PATH = '/departments'; // Define the specific path for departments

const getAllDepartments = () => {
  return api.get(API_PATH); // Use api instance, no need for headers/full URL
};

const getDepartmentById = (id) => {
  return api.get(`${API_PATH}/${id}`);
};

const createDepartment = (departmentData) => {
  return api.post(API_PATH, departmentData);
};

const updateDepartment = (id, departmentData) => {
  return api.put(`${API_PATH}/${id}`, departmentData);
};

const deleteDepartment = (id) => {
  return api.delete(`${API_PATH}/${id}`);
};

const departmentService = {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};

export default departmentService; 