import api from './api'; // Import the configured axios instance

// Lưu trữ thông tin người dùng đăng nhập trong localStorage
const TOKEN_KEY = 'event_auth_token'; // Adjusted key for consistency
const USER_KEY = 'event_user';       // Adjusted key for consistency
const REMEMBER_KEY = 'event_remember'; // Key for remember me functionality

// Dịch vụ xác thực
const authService = {
  /**
   * Login user
   * @param {Object} credentials - User login credentials
   * @param {string} credentials.username - Username (changed from email)
   * @param {string} credentials.password - User password
   * @returns {Promise<Object>} - Response with token and user data
   */
  login: async (credentials) => {
    try {
      // Ensure credentials has username and password as expected by backend
      const loginPayload = { 
        username: credentials.username, 
        password: credentials.password 
      };
      const response = await api.post('/auth/login', loginPayload);
      const { token, user } = response.data;
      if (token && user) {
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
      } else {
        // Ensure keys are removed if login fails to return expected data
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        throw new Error('Invalid response from server during login');
      }
      return response.data; // Return the full response data
    } catch (error) {
      // Clear keys on any login error
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      console.error('Login error in authService:', error);
      throw error.response ? error.response.data : error; // Re-throw for component handling
    }
  },

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @param {string} userData.fullName - Full name
   * @param {string} userData.email - Email
   * @param {string} userData.phone - Phone number
   * @param {string} userData.password - Password
   * @returns {Promise<Object>} - Response with success flag and message
   */
  register: async (userData) => {
    try {
      // Ensure a default role is included if not provided
      const dataToSend = { 
        ...userData, 
        role: userData.role || 'USER' // Set default role to USER
      };
      const response = await api.post('/auth/register', dataToSend);
      return response.data;
    } catch (error) {
      console.error('Registration error in authService:', error);
      throw error.response ? error.response.data : error; // Re-throw for component handling
    }
  },

  /**
   * Set or remove the remember me flag
   * @param {boolean} remember - Whether to remember the user
   */
  setRememberMe: (remember) => {
    if (remember) {
      localStorage.setItem(REMEMBER_KEY, 'true');
    } else {
      localStorage.removeItem(REMEMBER_KEY);
    }
  },

  /**
   * Check if the user should be remembered
   * @returns {boolean} - True if remember me was set
   */
  shouldRememberMe: () => {
    return localStorage.getItem(REMEMBER_KEY) === 'true';
  },
  
  // Kiểm tra đã đăng nhập chưa
  isAuthenticated: () => {
    const token = localStorage.getItem(TOKEN_KEY);
    // Optionally, also check if user data exists
    // const user = localStorage.getItem(USER_KEY);
    return !!token; // Primarily check for token
  },
  
  // Lấy thông tin người dùng hiện tại
  getCurrentUser: () => {
    const userJson = localStorage.getItem(USER_KEY);
    try {
      return userJson ? JSON.parse(userJson) : null;
    } catch (e) {
      console.error('Error parsing user data from localStorage:', e);
      // Clear corrupted data
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(TOKEN_KEY); 
      return null;
    }
  },
  
  // Đăng xuất
  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(REMEMBER_KEY); // Also clear remember me flag
  },
  
  // Lấy token
  getToken: () => {
    return localStorage.getItem(TOKEN_KEY);
  },

  /**
   * Check if user has specific role
   * @param {string} role - The role to check for (e.g., 'ADMIN', 'USER')
   * @returns {boolean} - True if user has the specified role
   */
  hasRole: (role) => {
    const user = authService.getCurrentUser();
    return user && user.role?.toUpperCase() === role?.toUpperCase();
  },

  /**
   * Request password reset
   * @param {Object} data - Reset request data
   * @param {string} data.email - User email
   * @returns {Promise<Object>} - Response data
   */
  forgotPassword: async (data) => {
    // Backend expects email as @RequestParam, not in body
    const email = data?.email; 
    if (!email) {
      throw new Error('Email is required for password reset.');
    }
    try {
      // Send email as query parameter
      const response = await api.post(`/auth/forgot-password?email=${encodeURIComponent(email)}`);
      return response.data;
    } catch (error) {
      console.error('Forgot password error:', error);
      // Re-throw standardized error
      throw error.response?.data || { message: error.message || 'Yêu cầu đặt lại mật khẩu thất bại.' }; 
    }
  },

  /**
   * Reset password with token
   * @param {Object} data - New password data
   * @param {string} data.token - Reset token
   * @param {string} data.password - New password
   * @returns {Promise<Object>} - Response data
   */
  resetPassword: async (data) => {
    try {
      const response = await api.post('/auth/reset-password', data);
      return response.data;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error.response ? error.response.data : error;
    }
  },

  /**
   * Update user profile
   * @param {Object} userData - User data to update
   * @returns {Promise<Object>} - Updated user data
   */
  updateProfile: async (userData) => {
    try {
      const response = await api.put('/users/profile', userData);
      
      // Update stored user data
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
          const updatedUser = { ...currentUser, ...response.data };
          localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      }
      
      return response.data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error.response ? error.response.data : error;
    }
  },

  /**
   * Change user password
   * @param {Object} passwordData - Password change data
   * @param {string} passwordData.currentPassword - Current password
   * @param {string} passwordData.newPassword - New password
   * @returns {Promise<Object>} - Response data
   */
  changePassword: async (passwordData) => {
    try {
      const response = await api.post('/users/change-password', passwordData);
      return response.data;
    } catch (error) {
      console.error('Change password error:', error);
      throw error.response ? error.response.data : error;
    }
  }
};

// Add the new forgotPassword function
const forgotPassword = async (email) => {
  try {
    // The backend expects email as a request param, so we add it to the URL query string
    const response = await api.post(`/auth/forgot-password?email=${encodeURIComponent(email)}`);
    return response.data; // Or handle success appropriately
  } catch (error) {
    console.error('Forgot password error:', error.response || error.message);
    throw error.response?.data || { message: error.message || 'Yêu cầu đặt lại mật khẩu thất bại.' };
  }
};

export default authService; 