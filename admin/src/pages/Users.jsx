import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FaEdit, FaTrash, FaPlus, FaSearch, FaUserShield, FaUpload } from 'react-icons/fa';
import authService from '../services/auth.service';
import userService from '../services/user.service';
import departmentService from '../services/department.service';
import officeService from '../services/office.service';
import imageService from '../services/imageService';
import { toast } from 'react-toastify';

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  } catch (error) {
    return 'Invalid Date';
  }
};

const Users = () => {
  const [users, setUsers] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [currentUserData, setCurrentUserData] = useState(null);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    role: 'STAFF',
    phone: '',
    imageUrl: '',
    departmentId: '',
    officeId: ''
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState({});
  
  // Refs for file inputs
  const newAvatarInputRef = useRef(null);
  const editAvatarInputRef = useRef(null);

  const roles = ['ADMIN', 'MANAGER', 'ORGANIZER', 'STAFF', 'USER'];

  const loggedInUser = authService.getCurrentUser();
  const isAdmin = loggedInUser && loggedInUser.role === 'ADMIN';

  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const [userRes, facultyRes, officeRes] = await Promise.all([
        userService.getAllUsers(),
        departmentService.getAllDepartments(),
        officeService.getAllOffices()
      ]);
      setUsers(userRes.data);
      setFaculties(facultyRes.data);
      setOffices(officeRes.data);
    } catch (error) {
      console.error("Error fetching initial data:", error);
      toast.error('Tải dữ liệu thất bại.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const filteredUsers = users.filter(user => {
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (user.username && user.username.toLowerCase().includes(searchLower)) ||
                          (user.email && user.email.toLowerCase().includes(searchLower)) ||
                          (user.phone && user.phone.toLowerCase().includes(searchLower)) ||
                          (user.department?.name && user.department.name.toLowerCase().includes(searchLower)) ||
                          (user.office?.name && user.office.name.toLowerCase().includes(searchLower));
    return matchesRole && matchesSearch;
  });

  const openAddModal = () => {
    setNewUser({ username: '', email: '', password: '', role: 'STAFF', phone: '', imageUrl: '', departmentId: '', officeId: '' });
    setShowAddModal(true);
  };

  const openEditModal = (user) => {
    setCurrentUserData({
      ...user,
      departmentId: user.department?.id || '',
      officeId: user.office?.id || '',
      password: ''
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (user) => {
    setCurrentUserData(user);
    setShowDeleteModal(true);
  };

  const openRoleModal = (user) => {
    setCurrentUserData({
      ...user,
      departmentId: user.department?.id || '',
      officeId: user.office?.id || ''
    });
    setShowRoleModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (showEditModal || showRoleModal) {
      setCurrentUserData(prev => ({ ...prev, [name]: value }));
    } else {
      setNewUser(prev => ({ ...prev, [name]: value }));
    }
    // Clear specific error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!validateForm(newUser, true)) { // Validate newUser, pass true for isNewUser
      return; // Stop if validation fails
    }

    const payload = { 
        ...newUser, 
        department: newUser.departmentId ? { id: newUser.departmentId } : null, 
        office: newUser.officeId ? { id: newUser.officeId } : null
    };
    delete payload.departmentId;
    delete payload.officeId;

    try {
      const response = await userService.addUser(payload);
      setUsers([response.data, ...users]);
      setShowAddModal(false);
      toast.success('Thêm người dùng thành công!');
    } catch (error) {
      console.error("Error adding user:", error);
      toast.error(error.response?.data?.message || 'Thêm người dùng thất bại.');
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!currentUserData || !currentUserData.id) return;
    if (!validateForm(currentUserData, false)) { // Validate currentUserData, pass false for isNewUser
      return; // Stop if validation fails
    }
    
    const payload = { 
      username: currentUserData.username,
      email: currentUserData.email,
      phone: currentUserData.phone,
      imageUrl: currentUserData.imageUrl,
      role: currentUserData.role,
      department: currentUserData.departmentId ? { id: currentUserData.departmentId } : null, 
      office: currentUserData.officeId ? { id: currentUserData.officeId } : null
    };
    if (currentUserData.password && currentUserData.password.trim() !== '') {
        payload.password = currentUserData.password;
    }

    try {
      const response = await userService.updateUser(currentUserData.id, payload);
      setUsers(users.map(user => 
        user.id === currentUserData.id ? response.data : user
      ));
      setShowEditModal(false);
      setCurrentUserData(null);
      toast.success('Cập nhật người dùng thành công!');
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error(error.response?.data?.message || 'Cập nhật người dùng thất bại.');
    }
  };

  const handleDeleteUser = async () => {
    if (!currentUserData || !currentUserData.id) return;
    try {
      await userService.deleteUser(currentUserData.id);
      setUsers(users.filter(user => user.id !== currentUserData.id));
      setShowDeleteModal(false);
      setCurrentUserData(null);
      toast.success('Xóa người dùng thành công!');
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error(error.response?.data?.message || 'Xóa người dùng thất bại.');
    }
  };

  const handleChangeRole = async () => {
     if (!currentUserData || !currentUserData.id) return;
      const payload = { 
        role: currentUserData.role,
      };
      try {
         const response = await userService.updateUser(currentUserData.id, payload);
          setUsers(users.map(user => user.id === currentUserData.id ? response.data : user));
          setShowRoleModal(false);
          setCurrentUserData(null);
          toast.success('Cập nhật vai trò thành công!');
      } catch(error) {
          console.error("Error changing role:", error);
          toast.error('Cập nhật vai trò thất bại.');
      }
  };

  // Hàm upload ảnh
  const handleImageUpload = async (file, type = 'new') => {
    if (!file) return null;
    
    setUploadingImage(true);
    setUploadProgress(10);
    
    try {
      // Giới hạn kích thước file (tối đa 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Kích thước file quá lớn. Vui lòng chọn file nhỏ hơn 5MB.');
      }
      
      // Giả lập tiến trình tải lên
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const next = prev + 10;
          return next < 90 ? next : prev;
        });
      }, 300);
      
      // Upload ảnh lên ImgBB
      const response = await imageService.uploadImage(file, file.name);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      if (response.success) {
        // Lấy URL hình ảnh từ response
        const imageUrl = response.data.display_url;
        
        // Cập nhật state tương ứng
        if (type === 'new') {
          setNewUser(prev => ({ ...prev, imageUrl: imageUrl }));
        } else if (type === 'edit') {
          setCurrentUserData(prev => ({ ...prev, imageUrl: imageUrl }));
        }
        
        toast.success('Tải ảnh đại diện lên thành công!');
        return imageUrl;
      } else {
        throw new Error('Tải ảnh lên không thành công');
      }
    } catch (err) {
      console.error('Lỗi khi tải ảnh lên:', err);
      toast.error(`Lỗi tải ảnh lên: ${err.message}`);
      return null;
    } finally {
      setUploadingImage(false);
      setUploadProgress(0);
      // Reset file input
      if (type === 'new' && newAvatarInputRef.current) {
        newAvatarInputRef.current.value = '';
      } else if (type === 'edit' && editAvatarInputRef.current) {
        editAvatarInputRef.current.value = '';
      }
    }
  };
  
  // Xử lý khi người dùng chọn file ảnh mới
  const handleNewAvatarSelect = async (e) => {
    const file = e.target.files[0];
    if (file) {
      await handleImageUpload(file, 'new');
    }
  };
  
  // Xử lý khi người dùng chọn file ảnh trong form chỉnh sửa
  const handleEditAvatarSelect = async (e) => {
    const file = e.target.files[0];
    if (file) {
      await handleImageUpload(file, 'edit');
    }
  };

  // --- Validation Function ---
  const validateForm = (userData, isNewUser = false) => {
    const newErrors = {};
    const trimmedUsername = userData.username?.trim();

    if (!trimmedUsername) {
      newErrors.username = 'Tên đăng nhập là bắt buộc.';
    } else if (trimmedUsername.length < 3) {
      newErrors.username = 'Tên đăng nhập phải có ít nhất 3 ký tự.';
    } else if (trimmedUsername.normalize("NFD").replace(/[\u0300-\u036f]/g, "") !== trimmedUsername) {
      newErrors.username = 'Tên đăng nhập không được chứa dấu.';
    }

    if (!userData.email?.trim()) {
      newErrors.email = 'Email là bắt buộc.';
    } else if (!/\S+@\S+\.\S+/.test(userData.email)) {
      newErrors.email = 'Địa chỉ email không hợp lệ.';
    }

    if (isNewUser && !userData.password?.trim()) {
      newErrors.password = 'Mật khẩu là bắt buộc khi tạo mới.';
    } else if (userData.password?.trim() && userData.password.trim().length < 6) {
        // Validate password length only if it's provided (for both add and edit)
        newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự.';
    }

    if (!userData.phone?.trim()) {
      newErrors.phone = 'Số điện thoại là bắt buộc.';
    } else if (!/^[0-9]{10,}$/.test(userData.phone.trim())) {
       // Basic check for at least 10 digits 
       newErrors.phone = 'Số điện thoại không hợp lệ.';
    }

    if (!userData.role || !roles.includes(userData.role)) {
      newErrors.role = 'Vai trò không hợp lệ.';
    }
    
    // Optional: Validate URL format if imageUrl is provided
    if (userData.imageUrl?.trim() && !/^https?:\/\/.+\..+/.test(userData.imageUrl.trim())) {
        newErrors.imageUrl = 'URL ảnh đại diện không hợp lệ.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  // --- End Validation Function ---

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý Người Dùng</h1>
        {isAdmin && (
          <button 
            onClick={openAddModal}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            <FaPlus className="mr-2" /> Thêm Người Dùng
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between mb-4 space-y-2 md:space-y-0">
          <div className="relative w-full md:w-1/3">
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email, SĐT, khoa, phòng..."
              className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
          
          <select
            className="w-full md:w-1/4 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="ALL">Tất cả vai trò</option>
            {roles.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Không tìm thấy người dùng nào phù hợp.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người dùng</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vai trò</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khoa/Phòng ban</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map(user => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <img className="h-10 w-10 rounded-full object-cover" src={user.imageUrl || `https://ui-avatars.com/api/?name=${user.username}&background=random`} alt={user.username} />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.username}</div>
                              <div className="text-sm text-gray-500">{user.phone}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 truncate" title={user.email}>{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 
                              user.role === 'MANAGER' ? 'bg-blue-100 text-blue-800' : 
                              user.role === 'ORGANIZER' ? 'bg-green-100 text-green-800' : 
                              user.role === 'STAFF' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-gray-100 text-gray-800'}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.department?.name || '-'}</div>
                          <div className="text-sm text-gray-500">{user.office?.name || '-'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end items-center space-x-2">
                            {isAdmin && user.id !== loggedInUser.id && (
                              <button 
                                onClick={() => openRoleModal(user)}
                                className="text-indigo-600 hover:text-indigo-900 p-1"
                                title="Phân quyền"
                              >
                                <FaUserShield />
                              </button>
                            )}
                            {isAdmin && user.id !== loggedInUser.id && (
                              <>
                                <button 
                                  onClick={() => openEditModal(user)}
                                  className="text-blue-600 hover:text-blue-900 p-1"
                                  title="Chỉnh sửa"
                                >
                                  <FaEdit />
                                </button>
                                <button 
                                  onClick={() => openDeleteModal(user)}
                                  className="text-red-600 hover:text-red-900 p-1"
                                  title="Xóa"
                                >
                                  <FaTrash />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-6">Thêm Người Dùng Mới</h2>
            <form onSubmit={handleAddUser}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                 <div>
                   <label className="block text-gray-700 text-sm font-bold mb-2">Tên đăng nhập *</label>
                   <input
                     type="text"
                     name="username"
                     className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                     value={newUser.username}
                     onChange={handleInputChange}
                     required
                   />
                   {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
                 </div>
                 <div>
                   <label className="block text-gray-700 text-sm font-bold mb-2">Email *</label>
                   <input
                     type="email"
                     name="email"
                     className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                     value={newUser.email}
                     onChange={handleInputChange}
                     required
                   />
                   {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                 </div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                 <div>
                   <label className="block text-gray-700 text-sm font-bold mb-2">Mật khẩu *</label>
                   <input
                     type="password"
                     name="password"
                     className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                     value={newUser.password}
                     onChange={handleInputChange}
                     required
                   />
                   {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                 </div>
                  <div>
                   <label className="block text-gray-700 text-sm font-bold mb-2">Số điện thoại *</label>
                   <input
                     type="tel"
                     name="phone"
                     className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                     value={newUser.phone}
                     onChange={handleInputChange}
                     required
                   />
                   {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                 </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                   <label className="block text-gray-700 text-sm font-bold mb-2">Vai trò *</label>
                   <select
                     name="role"
                     className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                     value={newUser.role}
                     onChange={handleInputChange}
                     required
                   >
                     {roles.map(role => (
                       <option key={role} value={role}>{role}</option>
                     ))}
                   </select>
                   {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
                 </div>
                 <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">Ảnh đại diện</label>
                  <div className="flex flex-col space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleNewAvatarSelect}
                      ref={newAvatarInputRef}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      disabled={loading || uploadingImage}
                    />
                    <input
                      type="url"
                      name="imageUrl"
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={newUser.imageUrl}
                      onChange={handleInputChange}
                      placeholder="https://example.com/avatar.jpg"
                    />
                    
                    {uploadingImage && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Đang tải lên... {uploadProgress}%</p>
                      </div>
                    )}
                    
                    {newUser.imageUrl && (
                      <div className="mt-2 flex justify-center">
                        <img 
                          src={newUser.imageUrl} 
                          alt="Avatar Preview" 
                          className="h-24 w-24 object-cover rounded-full border-2 border-gray-200"
                          onError={(e) => { e.target.onerror = null; e.target.src='https://ui-avatars.com/api/?name=User&background=random'; }}
                        />
                      </div>
                    )}
                  </div>
                 </div>
              </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                 <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">Khoa (Tùy chọn)</label>
                   <select
                     name="departmentId"
                     className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                     value={newUser.departmentId}
                     onChange={handleInputChange}
                   >
                     <option value="">-- Không chọn --</option>
                     {faculties.map(faculty => (
                       <option key={faculty.id} value={faculty.id}>{faculty.name}</option>
                     ))}
                   </select>
                 </div>
                 <div>
                   <label className="block text-gray-700 text-sm font-bold mb-2">Phòng ban (Tùy chọn)</label>
                   <select
                     name="officeId"
                     className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                     value={newUser.officeId}
                     onChange={handleInputChange}
                   >
                     <option value="">-- Không chọn --</option>
                     {offices.map(office => (
                       <option key={office.id} value={office.id}>{office.name}</option>
                     ))}
                   </select>
                 </div>
               </div>
            
              <div className="flex justify-end space-x-2 mt-6 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  disabled={!newUser.username || !newUser.email || !newUser.password || !newUser.phone}
                >
                  Thêm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && currentUserData && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
             <h2 className="text-xl font-bold mb-6">Chỉnh Sửa Người Dùng</h2>
             <form onSubmit={handleUpdateUser}>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                 <div>
                   <label className="block text-gray-700 text-sm font-bold mb-2">Tên đăng nhập *</label>
                   <input
                     type="text"
                     name="username"
                     className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100"
                     value={currentUserData.username}
                     onChange={handleInputChange}
                     required
                     readOnly
                   />
                 </div>
                 <div>
                   <label className="block text-gray-700 text-sm font-bold mb-2">Email *</label>
                   <input
                     type="email"
                     name="email"
                     className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                     value={currentUserData.email}
                     onChange={handleInputChange}
                     required
                   />
                   {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                 </div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                 <div>
                   <label className="block text-gray-700 text-sm font-bold mb-2">Mật khẩu (Để trống nếu không đổi)</label>
                   <input
                     type="password"
                     name="password"
                     className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                     value={currentUserData.password}
                     onChange={handleInputChange} 
                     placeholder="********"
                   />
                   {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                 </div>
                 <div>
                   <label className="block text-gray-700 text-sm font-bold mb-2">Số điện thoại *</label>
                   <input
                     type="tel"
                     name="phone"
                     className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                     value={currentUserData.phone}
                     onChange={handleInputChange}
                     required
                   />
                   {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                 </div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                   <label className="block text-gray-700 text-sm font-bold mb-2">Vai trò *</label>
                    <input 
                     type="text"
                     name="role"
                     className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100"
                     value={currentUserData.role}
                     readOnly
                    />
                  </div>
                  <div>
                   <label className="block text-gray-700 text-sm font-bold mb-2">Ảnh đại diện</label>
                   <div className="flex flex-col space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleEditAvatarSelect}
                      ref={editAvatarInputRef}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      disabled={loading || uploadingImage}
                    />
                    <input
                      type="url"
                      name="imageUrl"
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={currentUserData.imageUrl || ''}
                      onChange={handleInputChange}
                      placeholder="https://example.com/avatar.jpg"
                    />
                    
                    {uploadingImage && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Đang tải lên... {uploadProgress}%</p>
                      </div>
                    )}
                    
                    {currentUserData.imageUrl && (
                      <div className="mt-2 flex justify-center">
                        <img 
                          src={currentUserData.imageUrl} 
                          alt="Avatar Preview" 
                          className="h-24 w-24 object-cover rounded-full border-2 border-gray-200"
                          onError={(e) => { e.target.onerror = null; e.target.src=`https://ui-avatars.com/api/?name=${currentUserData.username}&background=random`; }}
                        />
                      </div>
                    )}
                   </div>
                  </div>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                   <label className="block text-gray-700 text-sm font-bold mb-2">Khoa (Tùy chọn)</label>
                   <select
                     name="departmentId"
                     className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                     value={currentUserData.departmentId}
                     onChange={handleInputChange}
                   >
                     <option value="">-- Không chọn --</option>
                     {faculties.map(faculty => (
                       <option key={faculty.id} value={faculty.id}>{faculty.name}</option>
                     ))}
                   </select>
                  </div>
                  <div>
                   <label className="block text-gray-700 text-sm font-bold mb-2">Phòng ban (Tùy chọn)</label>
                   <select
                     name="officeId"
                     className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                     value={currentUserData.officeId}
                     onChange={handleInputChange}
                   >
                     <option value="">-- Không chọn --</option>
                     {offices.map(office => (
                       <option key={office.id} value={office.id}>{office.name}</option>
                     ))}
                   </select>
                  </div>
                </div>
             
               <div className="flex justify-end space-x-2 mt-6 pt-4 border-t">
                 <button
                   type="button"
                   onClick={() => setShowEditModal(false)}
                   className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100"
                 >
                   Hủy
                 </button>
                 <button
                   type="submit"
                   className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    disabled={!currentUserData.email || !currentUserData.phone}
                 >
                   Cập nhật
                 </button>
               </div>
             </form>
           </div>
         </div>
      )}

      {showDeleteModal && currentUserData && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <div className="mt-3 text-center">
               <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                 <FaTrash className="h-6 w-6 text-red-600" />
               </div>
               <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">Xác nhận xóa người dùng</h3>
               <div className="mt-2 px-7 py-3">
                 <p className="text-sm text-gray-500">
                   Bạn có chắc chắn muốn xóa người dùng <span className="font-semibold">{currentUserData.username}</span>? Hành động này không thể hoàn tác.
                 </p>
               </div>
               <div className="mt-5 px-7 py-3 flex justify-center space-x-3">
                 <button
                   onClick={() => setShowDeleteModal(false)}
                   className="px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md w-24 hover:bg-gray-400"
                 >
                   Hủy
                 </button>
                 <button
                   onClick={handleDeleteUser}
                   className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md w-24 hover:bg-red-700"
                 >
                   Xóa
                 </button>
               </div>
             </div>
           </div>
         </div>
      )}

      {showRoleModal && currentUserData && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-lg p-6 max-w-md w-full">
             <h2 className="text-xl font-bold mb-4">Phân quyền người dùng</h2>
             <p className="mb-4">Thay đổi vai trò cho người dùng <span className="font-semibold">{currentUserData.username}</span></p>
             
             <div className="mb-4">
               <label className="block text-gray-700 text-sm font-bold mb-2">Vai trò</label>
               <select
                 name="role"
                 className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                 value={currentUserData.role}
                 onChange={handleInputChange}
               >
                 {roles.map(role => (
                   <option key={role} value={role}>{role}</option>
                 ))}
               </select>
             </div>
             
             <div className="flex justify-end space-x-2 mt-6 pt-4 border-t">
               <button
                 onClick={() => setShowRoleModal(false)}
                 className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100"
               >
                 Hủy
               </button>
               <button
                 onClick={handleChangeRole}
                 className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
               >
                 Cập nhật vai trò
               </button>
             </div>
           </div>
         </div>
      )}
    </div>
  );
};

export default Users;
