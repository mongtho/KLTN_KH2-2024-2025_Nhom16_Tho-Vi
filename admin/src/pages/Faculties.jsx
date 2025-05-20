import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FaEdit, FaTrash, FaPlus, FaSearch } from 'react-icons/fa';
import authService from '../services/auth.service';
import departmentService from '../services/department.service';
import imageService from '../services/imageService';
import { toast } from 'react-toastify';

const Faculties = () => {
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentFaculty, setCurrentFaculty] = useState(null);
  const [newFaculty, setNewFaculty] = useState({
    name: '',
    description: '',
    headOfDepartment: '',
    establishmentYear: '',
    location: '',
    contactEmail: '',
    contactPhone: '',
    website: '',
    logoUrl: ''
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const newLogoInputRef = useRef(null);
  const editLogoInputRef = useRef(null);

  const fetchFaculties = useCallback(async () => {
    setLoading(true);
    try {
      const response = await departmentService.getAllDepartments();
      setFaculties(response.data);
    } catch (error) {
      console.error("Lỗi khi tải danh sách khoa:", error);
      toast.error('Tải danh sách khoa thất bại. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFaculties();
  }, [fetchFaculties]);

  // Filter faculties based on search term
  const filteredFaculties = faculties.filter(faculty => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (faculty.name && faculty.name.toLowerCase().includes(searchLower)) ||
      (faculty.description && faculty.description.toLowerCase().includes(searchLower)) ||
      (faculty.headOfDepartment && faculty.headOfDepartment.toLowerCase().includes(searchLower))
    );
  });

  // Handle opening modals
  const openAddModal = () => {
    setNewFaculty({
      name: '',
      description: '',
      headOfDepartment: '',
      establishmentYear: '',
      location: '',
      contactEmail: '',
      contactPhone: '',
      website: '',
      logoUrl: ''
    });
    setShowAddModal(true);
  };

  const openEditModal = (faculty) => {
    setCurrentFaculty({ ...faculty }); // Create a copy to avoid direct state mutation
    setShowEditModal(true);
  };

  const openDeleteModal = (faculty) => {
    setCurrentFaculty(faculty);
    setShowDeleteModal(true);
  };

  // Handle form input changes
  const handleNewFacultyChange = (e) => {
    const { name, value } = e.target;
    setNewFaculty(prev => ({ ...prev, [name]: value }));
  };

  const handleCurrentFacultyChange = (e) => {
    const { name, value } = e.target;
    setCurrentFaculty(prev => ({ ...prev, [name]: value }));
  };

  // Handle API interactions
  const handleAddFaculty = async () => {
    try {
      const payload = {
        ...newFaculty,
        establishmentYear: newFaculty.establishmentYear ? parseInt(newFaculty.establishmentYear) : null
      };
      const response = await departmentService.createDepartment(payload);
      setFaculties([...faculties, response.data]);
      setShowAddModal(false);
      toast.success('Thêm khoa thành công!');
    } catch (error) {
      console.error("Lỗi khi thêm khoa:", error);
      toast.error('Thêm khoa thất bại. Kiểm tra console để biết chi tiết.');
    }
  };

  const handleUpdateFaculty = async () => {
    if (!currentFaculty || !currentFaculty.id) return;
    try {
      const payload = {
        ...currentFaculty,
        establishmentYear: currentFaculty.establishmentYear ? parseInt(currentFaculty.establishmentYear) : null
      };
      const response = await departmentService.updateDepartment(currentFaculty.id, payload);
      const updatedFaculties = faculties.map(faculty =>
        faculty.id === currentFaculty.id ? response.data : faculty
      );
      setFaculties(updatedFaculties);
      setShowEditModal(false);
      setCurrentFaculty(null);
      toast.success('Cập nhật khoa thành công!');
    } catch (error) {
      console.error("Lỗi khi cập nhật khoa:", error);
      toast.error('Cập nhật khoa thất bại. Kiểm tra console để biết chi tiết.');
    }
  };

  const handleDeleteFaculty = async () => {
    if (!currentFaculty || !currentFaculty.id) return;
    try {
      await departmentService.deleteDepartment(currentFaculty.id);
      const updatedFaculties = faculties.filter(faculty => faculty.id !== currentFaculty.id);
      setFaculties(updatedFaculties);
      setShowDeleteModal(false);
      setCurrentFaculty(null);
      toast.success('Xóa khoa thành công!');
    } catch (error) {
      console.error("Lỗi khi xóa khoa:", error);
      toast.error('Xóa khoa thất bại. Kiểm tra console để biết chi tiết.');
    }
  };

  // --- Image Upload Functions (copied from Departments.jsx) ---
  const handleImageUpload = async (file, type = 'new') => {
    if (!file) return null;
    
    setUploadingImage(true);
    setUploadProgress(10);
    
    try {
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Kích thước file quá lớn. Vui lòng chọn file nhỏ hơn 5MB.');
      }
      
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const next = prev + 10;
          return next < 90 ? next : prev;
        });
      }, 300);
      
      const response = await imageService.uploadImage(file, file.name);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      if (response.success) {
        const imageUrl = response.data.display_url;
        
        if (type === 'new') {
          setNewFaculty(prev => ({ ...prev, logoUrl: imageUrl })); // Update setNewFaculty
        } else if (type === 'edit') {
          setCurrentFaculty(prev => ({ ...prev, logoUrl: imageUrl })); // Update setCurrentFaculty
        }
        
        toast.success('Tải ảnh lên thành công!');
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
      if (type === 'new' && newLogoInputRef.current) {
        newLogoInputRef.current.value = '';
      } else if (type === 'edit' && editLogoInputRef.current) {
        editLogoInputRef.current.value = '';
      }
    }
  };
  
  const handleNewLogoSelect = async (e) => {
    const file = e.target.files[0];
    if (file) {
      await handleImageUpload(file, 'new');
    }
  };
  
  const handleEditLogoSelect = async (e) => {
    const file = e.target.files[0];
    if (file) {
      await handleImageUpload(file, 'edit');
    }
  };
  // --- End Image Upload Functions ---

  // Check user role for permissions
  const currentLoggedInUser = authService.getCurrentUser();
  const isAdmin = currentLoggedInUser && currentLoggedInUser.role === 'ADMIN';
  const isManager = currentLoggedInUser && (currentLoggedInUser.role === 'MANAGER' || currentLoggedInUser.role === 'ADMIN');

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý Khoa</h1>
        <div className="flex space-x-2">
          {isAdmin && (
            <button
              onClick={openAddModal}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
            >
              <FaPlus className="mr-2" /> Thêm Khoa
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between mb-4 space-y-2 md:space-y-0">
          <div className="relative w-full md:w-1/3">
            <input
              type="text"
              placeholder="Tìm kiếm khoa..."
              className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {filteredFaculties.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Không tìm thấy khoa nào phù hợp với tiêu chí tìm kiếm.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFaculties.map(faculty => (
                  <div key={faculty.id} className="bg-white border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                    <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                      <div className="flex items-center">
                        {faculty.logoUrl && (
                          <div className="w-12 h-12 mr-3 flex-shrink-0">
                            <img src={faculty.logoUrl} alt={`Logo ${faculty.name}`} className="w-full h-full object-cover rounded" />
                          </div>
                        )}
                        <h3 className="text-lg font-semibold text-gray-800 truncate" title={faculty.name}>{faculty.name}</h3>
                      </div>
                      <div className="flex space-x-2 flex-shrink-0">
                        {isManager && (
                          <button
                            onClick={() => openEditModal(faculty)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Chỉnh sửa"
                          >
                            <FaEdit />
                          </button>
                        )}
                        {isAdmin && (
                          <button
                            onClick={() => openDeleteModal(faculty)}
                            className="text-red-600 hover:text-red-900"
                            title="Xóa"
                          >
                            <FaTrash />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="p-4 text-sm">
                      <p className="text-gray-600 mb-3 line-clamp-2" title={faculty.description}>{faculty.description || 'Không có mô tả'}</p>
                      <div className="mb-2">
                        <span className="font-semibold text-gray-700">Trưởng khoa:</span> {faculty.headOfDepartment || 'N/A'}
                      </div>
                      <div className="mb-2">
                        <span className="font-semibold text-gray-700">Năm thành lập:</span> {faculty.establishmentYear || 'N/A'}
                      </div>
                      <div className="mb-2">
                        <span className="font-semibold text-gray-700">Vị trí:</span> {faculty.location || 'N/A'}
                      </div>
                      <div className="mb-2 truncate">
                        <span className="font-semibold text-gray-700">Email:</span> {faculty.contactEmail || 'N/A'}
                      </div>
                      <div className="mb-2">
                        <span className="font-semibold text-gray-700">Điện thoại:</span> {faculty.contactPhone || 'N/A'}
                      </div>
                      <div className="mb-2 truncate">
                        <span className="font-semibold text-gray-700">Website:</span>
                        {faculty.website ? (
                          <a href={faculty.website.startsWith('http') ? faculty.website : `//${faculty.website}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                            {faculty.website}
                          </a>
                        ) : (
                          ' N/A'
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal Thêm Khoa */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-6">Thêm Khoa Mới</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Tên Khoa *</label>
                <input
                  type="text"
                  name="name"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newFaculty.name}
                  onChange={handleNewFacultyChange}
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Trưởng Khoa</label>
                <input
                  type="text"
                  name="headOfDepartment"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newFaculty.headOfDepartment}
                  onChange={handleNewFacultyChange}
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Mô Tả</label>
              <textarea
                name="description"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                value={newFaculty.description}
                onChange={handleNewFacultyChange}
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Năm Thành Lập</label>
                <input
                  type="number"
                  name="establishmentYear"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newFaculty.establishmentYear}
                  onChange={handleNewFacultyChange}
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Vị Trí</label>
                <input
                  type="text"
                  name="location"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newFaculty.location}
                  onChange={handleNewFacultyChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Email Liên Hệ</label>
                <input
                  type="email"
                  name="contactEmail"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newFaculty.contactEmail}
                  onChange={handleNewFacultyChange}
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Điện Thoại Liên Hệ</label>
                <input
                  type="tel"
                  name="contactPhone"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newFaculty.contactPhone}
                  onChange={handleNewFacultyChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">URL Website</label>
                <input
                  type="url"
                  name="website"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newFaculty.website}
                  onChange={handleNewFacultyChange}
                  placeholder="https://example.com"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Logo Khoa</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleNewLogoSelect}
                      ref={newLogoInputRef}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      disabled={loading || uploadingImage}
                    />
                    <p className="mt-1 text-xs text-gray-500">Tải lên logo (tối đa 5MB)</p>
                    
                    {uploadingImage && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Đang tải lên... {uploadProgress}%</p>
                      </div>
                    )}
                  </div>
                  <div>
                    <input
                      type="url"
                      name="logoUrl"
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={newFaculty.logoUrl}
                      onChange={handleNewFacultyChange}
                      placeholder="https://example.com/logo.png"
                    />
                    <p className="mt-1 text-xs text-gray-500">Hoặc nhập URL logo có sẵn</p>
                    
                    {newFaculty.logoUrl && (
                      <div className="mt-2">
                        <img 
                          src={newFaculty.logoUrl}
                          alt="Logo Preview" 
                          className="h-20 w-auto object-contain rounded-md border p-1"
                          onError={(e) => { e.target.onerror = null; e.target.src='https://via.placeholder.com/100x100?text=Logo+Error'; }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100"
              >
                Hủy
              </button>
              <button
                onClick={handleAddFaculty}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                disabled={!newFaculty.name}
              >
                Thêm Khoa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Chỉnh Sửa Khoa */}
      {showEditModal && currentFaculty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-6">Chỉnh Sửa Khoa</h2>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
               <div>
                 <label className="block text-gray-700 text-sm font-bold mb-2">Tên Khoa *</label>
                 <input
                   type="text"
                   name="name"
                   className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                   value={currentFaculty.name}
                   onChange={handleCurrentFacultyChange}
                   required
                 />
               </div>
               <div>
                 <label className="block text-gray-700 text-sm font-bold mb-2">Trưởng Khoa</label>
                 <input
                   type="text"
                   name="headOfDepartment"
                   className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                   value={currentFaculty.headOfDepartment}
                   onChange={handleCurrentFacultyChange}
                 />
               </div>
             </div>

             <div className="mb-4">
               <label className="block text-gray-700 text-sm font-bold mb-2">Mô Tả</label>
               <textarea
                 name="description"
                 className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                 rows="3"
                 value={currentFaculty.description}
                 onChange={handleCurrentFacultyChange}
               ></textarea>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
               <div>
                 <label className="block text-gray-700 text-sm font-bold mb-2">Năm Thành Lập</label>
                 <input
                   type="number"
                   name="establishmentYear"
                   className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                   value={currentFaculty.establishmentYear || ''}
                   onChange={handleCurrentFacultyChange}
                 />
               </div>
               <div>
                 <label className="block text-gray-700 text-sm font-bold mb-2">Vị Trí</label>
                 <input
                   type="text"
                   name="location"
                   className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                   value={currentFaculty.location}
                   onChange={handleCurrentFacultyChange}
                 />
               </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
               <div>
                 <label className="block text-gray-700 text-sm font-bold mb-2">Email Liên Hệ</label>
                 <input
                   type="email"
                   name="contactEmail"
                   className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                   value={currentFaculty.contactEmail}
                   onChange={handleCurrentFacultyChange}
                 />
               </div>
               <div>
                 <label className="block text-gray-700 text-sm font-bold mb-2">Điện Thoại Liên Hệ</label>
                 <input
                   type="tel"
                   name="contactPhone"
                   className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                   value={currentFaculty.contactPhone}
                   onChange={handleCurrentFacultyChange}
                 />
               </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
               <div>
                 <label className="block text-gray-700 text-sm font-bold mb-2">URL Website</label>
                 <input
                   type="url"
                   name="website"
                   className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                   value={currentFaculty.website}
                   onChange={handleCurrentFacultyChange}
                   placeholder="https://example.com"
                 />
               </div>
               <div>
                 <label className="block text-gray-700 text-sm font-bold mb-2">Logo Khoa</label>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                     <input
                       type="file"
                       accept="image/*"
                       onChange={handleEditLogoSelect}
                       ref={editLogoInputRef}
                       className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                       disabled={loading || uploadingImage}
                     />
                     <p className="mt-1 text-xs text-gray-500">Tải lên logo (tối đa 5MB)</p>
                     
                     {uploadingImage && (
                       <div className="mt-2">
                         <div className="w-full bg-gray-200 rounded-full h-2.5">
                           <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                         </div>
                         <p className="text-xs text-gray-500 mt-1">Đang tải lên... {uploadProgress}%</p>
                       </div>
                     )}
                   </div>
                   <div>
                     <input
                       type="url"
                       name="logoUrl"
                       className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                       value={currentFaculty.logoUrl}
                       onChange={handleCurrentFacultyChange}
                       placeholder="https://example.com/logo.png"
                     />
                     <p className="mt-1 text-xs text-gray-500">Hoặc nhập URL logo có sẵn</p>
                     
                     {currentFaculty.logoUrl && (
                       <div className="mt-2">
                         <img 
                           src={currentFaculty.logoUrl}
                           alt="Logo Preview" 
                           className="h-20 w-auto object-contain rounded-md border p-1"
                           onError={(e) => { e.target.onerror = null; e.target.src='https://via.placeholder.com/100x100?text=Logo+Error'; }}
                         />
                       </div>
                     )}
                   </div>
                 </div>
               </div>
             </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100"
              >
                Hủy
              </button>
              <button
                onClick={handleUpdateFaculty}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                disabled={!currentFaculty.name}
              >
                Cập Nhật Khoa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Xác Nhận Xóa Khoa */}
      {showDeleteModal && currentFaculty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Xác Nhận Xóa</h2>
            <p className="mb-6">Bạn có chắc chắn muốn xóa khoa <span className="font-semibold">{currentFaculty.name}</span>? Hành động này không thể hoàn tác.</p>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteFaculty}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Faculties; 