// Dữ liệu người dùng giả lập
const MOCK_USERS = [
  {
    id: 1,
    email: 'admin@edu.vn',
    password: 'admin123',
    name: 'Quản trị viên',
    role: 'ADMIN',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg'
  },
  {
    id: 2,
    email: 'manager@edu.vn',
    password: 'manager123',
    name: 'Quản lý',
    role: 'MANAGER',
    avatar: 'https://randomuser.me/api/portraits/women/2.jpg'
  },
  {
    id: 3,
    email: 'organizer@edu.vn',
    password: 'organizer123',
    name: 'Người tổ chức',
    role: 'ORGANIZER',
    avatar: 'https://randomuser.me/api/portraits/men/3.jpg'
  },
  {
    id: 4,
    email: 'staff@edu.vn',
    password: 'staff123',
    name: 'Sinh viên',
    role: 'STAFF',
    avatar: 'https://randomuser.me/api/portraits/women/4.jpg'
  }
];

// Lưu trữ thông tin người dùng đăng nhập trong localStorage
const TOKEN_KEY = 'edu_event_auth_token';
const USER_KEY = 'edu_event_user';

// Dịch vụ xác thực
const authService = {
  // Kiểm tra đã đăng nhập chưa
  isAuthenticated: () => {
    const token = localStorage.getItem(TOKEN_KEY);
    const user = localStorage.getItem(USER_KEY);
    return !!token && !!user;
  },
  
  // Lấy thông tin người dùng hiện tại
  getCurrentUser: () => {
    const userJson = localStorage.getItem(USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  },
  
  // Đăng xuất
  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
  
  // Lấy token
  getToken: () => {
    return localStorage.getItem(TOKEN_KEY);
  }
};

export default authService; 