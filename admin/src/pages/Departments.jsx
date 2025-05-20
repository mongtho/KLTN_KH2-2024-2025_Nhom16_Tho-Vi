import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FaEdit, FaTrash, FaPlus, FaSearch, FaBuilding, FaUpload } from 'react-icons/fa';
import authService from '../services/auth.service';
import officeService from '../services/office.service';
import imageService from '../services/imageService';
import { toast } from 'react-toastify';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentDepartment, setCurrentDepartment] = useState(null);
  const [newDepartment, setNewDepartment] = useState({
    name: '',
    description: '',
    officeHead: '',
    location: '',
    contactEmail: '',
    contactPhone: '',
    website: '',
    logoUrl: ''
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Refs for file inputs
  const newLogoInputRef = useRef(null);
  const editLogoInputRef = useRef(null);

  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await officeService.getAllOffices();
      setDepartments(response.data);
    } catch (error) {
      console.error("Lỗi khi tải danh sách phòng ban:", error);
      toast.error('Tải danh sách phòng ban thất bại. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const filteredDepartments = departments.filter(department => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (department.name && department.name.toLowerCase().includes(searchLower)) ||
      (department.description && department.description.toLowerCase().includes(searchLower)) ||
      (department.officeHead && department.officeHead.toLowerCase().includes(searchLower))
    );
  });

  const openAddModal = () => {
    setNewDepartment({
      name: '',
      description: '',
      officeHead: '',
      location: '',
      contactEmail: '',
      contactPhone: '',
      website: '',
      logoUrl: ''
    });
    setShowAddModal(true);
  };

  const openEditModal = (department) => {
    setCurrentDepartment({ ...department });
    setShowEditModal(true);
  };

  const openDeleteModal = (department) => {
    setCurrentDepartment(department);
    setShowDeleteModal(true);
  };

  const handleNewDepartmentChange = (e) => {
    const { name, value } = e.target;
    setNewDepartment(prev => ({ ...prev, [name]: value }));
  };

  const handleCurrentDepartmentChange = (e) => {
    const { name, value } = e.target;
    setCurrentDepartment(prev => ({ ...prev, [name]: value }));
  };

  const handleAddDepartment = async () => {
    try {
      const response = await officeService.createOffice(newDepartment);
      setDepartments([...departments, response.data]);
      setShowAddModal(false);
      toast.success('Thêm phòng ban thành công!');
    } catch (error) {
      console.error("Lỗi khi thêm phòng ban:", error);
      toast.error('Thêm phòng ban thất bại. Kiểm tra console.');
    }
  };

  const handleUpdateDepartment = async () => {
    if (!currentDepartment || !currentDepartment.id) return;
    try {
      const response = await officeService.updateOffice(currentDepartment.id, currentDepartment);
      const updatedDepartments = departments.map(dep =>
        dep.id === currentDepartment.id ? response.data : dep
      );
      setDepartments(updatedDepartments);
      setShowEditModal(false);
      setCurrentDepartment(null);
      toast.success('Cập nhật phòng ban thành công!');
    } catch (error) {
      console.error("Lỗi khi cập nhật phòng ban:", error);
      toast.error('Cập nhật phòng ban thất bại. Kiểm tra console.');
    }
  };

  const handleDeleteDepartment = async () => {
    if (!currentDepartment || !currentDepartment.id) return;
    try {
      await officeService.deleteOffice(currentDepartment.id);
      const updatedDepartments = departments.filter(dep => dep.id !== currentDepartment.id);
      setDepartments(updatedDepartments);
      setShowDeleteModal(false);
      setCurrentDepartment(null);
      toast.success('Xóa phòng ban thành công!');
    } catch (error) {
      console.error("Lỗi khi xóa phòng ban:", error);
      toast.error('Xóa phòng ban thất bại. Kiểm tra console.');
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
          setNewDepartment(prev => ({ ...prev, logoUrl: imageUrl }));
        } else if (type === 'edit') {
          setCurrentDepartment(prev => ({ ...prev, logoUrl: imageUrl }));
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
      // Reset file input
      if (type === 'new' && newLogoInputRef.current) {
        newLogoInputRef.current.value = '';
      } else if (type === 'edit' && editLogoInputRef.current) {
        editLogoInputRef.current.value = '';
      }
    }
  };
  
  // Xử lý khi người dùng chọn file ảnh mới
  const handleNewLogoSelect = async (e) => {
    const file = e.target.files[0];
    if (file) {
      await handleImageUpload(file, 'new');
    }
  };
  
  // Xử lý khi người dùng chọn file ảnh trong form chỉnh sửa
  const handleEditLogoSelect = async (e) => {
    const file = e.target.files[0];
    if (file) {
      await handleImageUpload(file, 'edit');
    }
  };

  const currentLoggedInUser = authService.getCurrentUser();
  const isAdmin = currentLoggedInUser && currentLoggedInUser.role === 'ADMIN';
  const isManager = currentLoggedInUser && (currentLoggedInUser.role === 'MANAGER' || currentLoggedInUser.role === 'ADMIN');

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý Phòng Ban</h1>
        <div className="flex space-x-2">
          {isAdmin && (
            <button
              onClick={openAddModal}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
            >
              <FaPlus className="mr-2" /> Thêm Phòng Ban
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between mb-4 space-y-2 md:space-y-0">
          <div className="relative w-full md:w-1/3">
            <input
              type="text"
              placeholder="Tìm kiếm phòng ban..."
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
            {filteredDepartments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Không tìm thấy phòng ban nào phù hợp với tiêu chí tìm kiếm.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDepartments.map(department => (
                  <div key={department.id} className="bg-white border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                    <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                      <div className="flex items-center">
                        {department.logoUrl && (
                          <div className="w-12 h-12 mr-3 flex-shrink-0">
                            <img src={department.logoUrl} alt={`Logo ${department.name}`} className="w-full h-full object-cover rounded" />
                          </div>
                        )}
                        <h3 className="text-lg font-semibold text-gray-800 truncate" title={department.name}>{department.name}</h3>
                      </div>
                      <div className="flex space-x-2 flex-shrink-0">
                        {isManager && (
                          <button
                            onClick={() => openEditModal(department)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Chỉnh sửa"
                          >
                            <FaEdit />
                          </button>
                        )}
                        {isAdmin && (
                          <button
                            onClick={() => openDeleteModal(department)}
                            className="text-red-600 hover:text-red-900"
                            title="Xóa"
                          >
                            <FaTrash />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="p-4 text-sm">
                      <p className="text-gray-600 mb-3 line-clamp-2" title={department.description}>{department.description || 'Không có mô tả'}</p>
                      <div className="mb-2">
                        <span className="font-semibold text-gray-700">Trưởng phòng:</span> {department.officeHead || 'N/A'}
                      </div>
                      <div className="mb-2">
                        <span className="font-semibold text-gray-700">Vị trí:</span> {department.location || 'N/A'}
                      </div>
                      <div className="mb-2 truncate">
                        <span className="font-semibold text-gray-700">Email:</span> {department.contactEmail || 'N/A'}
                      </div>
                      <div className="mb-2">
                        <span className="font-semibold text-gray-700">Điện thoại:</span> {department.contactPhone || 'N/A'}
                      </div>
                      <div className="mb-2 truncate">
                        <span className="font-semibold text-gray-700">Website:</span>
                        {department.website ? (
                          <a href={department.website.startsWith('http') ? department.website : `//${department.website}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                            {department.website}
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

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-6">Thêm Phòng Ban Mới</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Tên Phòng Ban *</label>
                <input
                  type="text"
                  name="name"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newDepartment.name}
                  onChange={handleNewDepartmentChange}
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Trưởng Phòng</label>
                <input
                  type="text"
                  name="officeHead"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newDepartment.officeHead}
                  onChange={handleNewDepartmentChange}
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Mô Tả</label>
              <textarea
                name="description"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                value={newDepartment.description}
                onChange={handleNewDepartmentChange}
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Vị Trí</label>
                <input
                  type="text"
                  name="location"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newDepartment.location}
                  onChange={handleNewDepartmentChange}
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Email Liên Hệ</label>
                <input
                  type="email"
                  name="contactEmail"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newDepartment.contactEmail}
                  onChange={handleNewDepartmentChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Điện Thoại Liên Hệ</label>
                <input
                  type="tel"
                  name="contactPhone"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newDepartment.contactPhone}
                  onChange={handleNewDepartmentChange}
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">URL Website</label>
                <input
                  type="url"
                  name="website"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newDepartment.website}
                  onChange={handleNewDepartmentChange}
                  placeholder="https://example.com"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Logo</label>
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
                    value={newDepartment.logoUrl}
                    onChange={handleNewDepartmentChange}
                    placeholder="https://example.com/logo.png"
                  />
                  <p className="mt-1 text-xs text-gray-500">Hoặc nhập URL logo có sẵn</p>
                  
                  {newDepartment.logoUrl && (
                    <div className="mt-2">
                      <img 
                        src={newDepartment.logoUrl} 
                        alt="Logo Preview" 
                        className="h-20 w-auto object-contain rounded-md border p-1"
                        onError={(e) => { e.target.onerror = null; e.target.src='https://via.placeholder.com/100x100?text=Logo+Error'; }}
                      />
                    </div>
                  )}
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
                onClick={handleAddDepartment}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                disabled={!newDepartment.name}
              >
                Thêm Phòng Ban
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && currentDepartment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-6">Chỉnh Sửa Phòng Ban</h2>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
               <div>
                 <label className="block text-gray-700 text-sm font-bold mb-2">Tên Phòng Ban *</label>
                 <input
                   type="text"
                   name="name"
                   className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                   value={currentDepartment.name}
                   onChange={handleCurrentDepartmentChange}
                   required
                 />
               </div>
               <div>
                 <label className="block text-gray-700 text-sm font-bold mb-2">Trưởng Phòng</label>
                 <input
                   type="text"
                   name="officeHead"
                   className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                   value={currentDepartment.officeHead}
                   onChange={handleCurrentDepartmentChange}
                 />
               </div>
             </div>

             <div className="mb-4">
               <label className="block text-gray-700 text-sm font-bold mb-2">Mô Tả</label>
               <textarea
                 name="description"
                 className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                 rows="3"
                 value={currentDepartment.description}
                 onChange={handleCurrentDepartmentChange}
               ></textarea>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
               <div>
                 <label className="block text-gray-700 text-sm font-bold mb-2">Vị Trí</label>
                 <input
                   type="text"
                   name="location"
                   className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                   value={currentDepartment.location}
                   onChange={handleCurrentDepartmentChange}
                 />
               </div>
               <div>
                 <label className="block text-gray-700 text-sm font-bold mb-2">Email Liên Hệ</label>
                 <input
                   type="email"
                   name="contactEmail"
                   className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                   value={currentDepartment.contactEmail}
                   onChange={handleCurrentDepartmentChange}
                 />
               </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
               <div>
                 <label className="block text-gray-700 text-sm font-bold mb-2">Điện Thoại Liên Hệ</label>
                 <input
                   type="tel"
                   name="contactPhone"
                   className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                   value={currentDepartment.contactPhone}
                   onChange={handleCurrentDepartmentChange}
                 />
               </div>
               <div>
                 <label className="block text-gray-700 text-sm font-bold mb-2">URL Website</label>
                 <input
                   type="url"
                   name="website"
                   className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                   value={currentDepartment.website}
                   onChange={handleCurrentDepartmentChange}
                   placeholder="https://example.com"
                 />
               </div>
             </div>
             <div className="mb-4">
               <label className="block text-gray-700 text-sm font-bold mb-2">Logo</label>
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
                     value={currentDepartment.logoUrl}
                     onChange={handleCurrentDepartmentChange}
                     placeholder="https://example.com/logo.png"
                   />
                   <p className="mt-1 text-xs text-gray-500">Hoặc nhập URL logo có sẵn</p>
                   
                   {currentDepartment.logoUrl && (
                     <div className="mt-2">
                       <img 
                         src={currentDepartment.logoUrl} 
                         alt="Logo Preview" 
                         className="h-20 w-auto object-contain rounded-md border p-1"
                         onError={(e) => { e.target.onerror = null; e.target.src='https://via.placeholder.com/100x100?text=Logo+Error'; }}
                       />
                     </div>
                   )}
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
                onClick={handleUpdateDepartment}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                disabled={!currentDepartment.name}
              >
                Cập Nhật Phòng Ban
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && currentDepartment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Xác Nhận Xóa</h2>
            <p className="mb-6">Bạn có chắc chắn muốn xóa phòng ban <span className="font-semibold">{currentDepartment.name}</span>? Hành động này không thể hoàn tác.</p>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteDepartment}
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

export default Departments;
