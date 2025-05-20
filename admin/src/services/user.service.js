import api from './api';

const API_PATH = '/users';

const getAllUsers = () => {
  return api.get(API_PATH);
};

const getUserById = (id) => {
  return api.get(`${API_PATH}/${id}`);
};

// Note: Backend uses AuthService for add/update/delete, which might be unusual.
// We'll map to the existing UserController endpoints.
const addUser = (userData) => {
  return api.post(API_PATH, userData);
};

const updateUser = (id, userData) => {
  // Remove password if it's empty or null to avoid overwriting
  const payload = { ...userData };
  if (!payload.password) {
    delete payload.password;
  }
  return api.put(`${API_PATH}/${id}`, payload);
};

const deleteUser = (id) => {
  return api.delete(`${API_PATH}/${id}`);
};

const searchUsers = (username) => {
    return api.get(`${API_PATH}/search`, { params: { username } });
}

const userService = {
  getAllUsers,
  getUserById,
  addUser, // Corresponds to POST /api/users
  updateUser, // Corresponds to PUT /api/users/{id}
  deleteUser, // Corresponds to DELETE /api/users/{id}
  searchUsers
};

export default userService; 