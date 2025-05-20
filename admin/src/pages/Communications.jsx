import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FaEdit, FaTrash, FaPlus, FaSearch, FaEye, FaCheck, FaTimes, FaUndo } from 'react-icons/fa';
import authService from '../services/auth.service';
import communicationService from '../services/communication.service';
import officeService from '../services/office.service';
import imageService from '../services/imageService';
import { toast } from 'react-toastify';

// Helper function to format dates (optional, adjust as needed)
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

const Communications = () => {
  const [communications, setCommunications] = useState([]);
  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showUnapproveModal, setShowUnapproveModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [unapproveReason, setUnapproveReason] = useState('');
  const [selectedCommunication, setSelectedCommunication] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [newCommunication, setNewCommunication] = useState({
    title: '',
    type: 'NEWS',
    content: '',
    image: '',
    officeId: ''
  });
  const currentUser = authService.getCurrentUser();
  console.log(currentUser);

  // Refs for file inputs
  const newCommImageInputRef = useRef(null);
  const editCommImageInputRef = useRef(null);

  // --- Data Fetching --- 
  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const [commResponse, officeResponse] = await Promise.all([
        communicationService.getAllCommunications(),
        officeService.getAllOffices()
      ]);
      setCommunications(commResponse.data);
      setOffices(officeResponse.data);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu ban đầu:", error);
      toast.error('Tải dữ liệu thất bại. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // --- Filtering --- 
  const filteredCommunications = communications.filter(comm => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (comm.title && comm.title.toLowerCase().includes(searchLower)) ||
                         (comm.content && comm.content.toLowerCase().includes(searchLower)) ||
                         (comm.authorName && comm.authorName.toLowerCase().includes(searchLower)) ||
                         (comm.office?.name && comm.office.name.toLowerCase().includes(searchLower));

    const matchesType = typeFilter === 'all' || comm.type.toUpperCase() === typeFilter.toUpperCase();
    return matchesSearch && matchesType;
  });

  // --- Modal Handling --- 
  const openAddModal = () => {
    setNewCommunication({ title: '', type: 'NEWS', content: '', image: '', officeId: '' });
    setShowAddModal(true);
  };

  const openEditModal = (communication) => {
    setSelectedCommunication({ 
      ...communication, 
      image: communication.imageUrl || '',
      officeId: communication.office?.id || ''
    });
    setShowEditModal(true);
  };

  const openViewModal = (communication) => {
    setSelectedCommunication(communication);
    setShowViewModal(true);
  };

  const openDeleteModal = (communication) => {
    setSelectedCommunication(communication);
    setShowDeleteModal(true);
  };
  
  const openApproveModal = (communication) => {
    setSelectedCommunication(communication);
    setShowApproveModal(true);
  };
  
  const openRejectModal = (communication) => {
    setSelectedCommunication(communication);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const openUnapproveModal = (communication) => {
    setSelectedCommunication(communication);
    setUnapproveReason('');
    setShowUnapproveModal(true);
  };

  // --- Form Input Handling --- 
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const targetStateUpdater = showEditModal ? setSelectedCommunication : setNewCommunication;
    targetStateUpdater(prev => ({ ...prev, [name]: value }));
  };

  // --- API Call Handlers --- 
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (uploadingImage) {
      toast.error("Vui lòng đợi quá trình tải ảnh lên hoàn tất.");
      return;
    }
    if (!newCommunication.officeId) {
      toast.error("Vui lòng chọn phòng ban/khoa.");
      return;
    }
    if (!currentUser || !currentUser.id) {
        toast.error("Không thể xác định người dùng hiện tại. Vui lòng đăng nhập lại.");
        return;
    }
    // Client-side validation for required fields
    if (!newCommunication.title.trim()) {
      toast.error("Tiêu đề không được để trống.");
      return;
    }
    if (!newCommunication.content.trim()) {
      toast.error("Nội dung không được để trống.");
      return;
    }
    // officeId is already checked above

    try {
      // Add this console.log to inspect the state right before sending
      console.log('State before sending (handleAddSubmit):', JSON.parse(JSON.stringify(newCommunication)));

      // Corrected structure for backend expectation
      const communicationToSend = {
        title: newCommunication.title,
        type: newCommunication.type,
        content: newCommunication.content,
        // Ensure officeId is correctly passed to create the office object
        office: newCommunication.officeId ? { id: newCommunication.officeId } : null, 
        // Ensure image (URL) is correctly passed
        imageUrl: newCommunication.image || null, 
        author: { id: currentUser.id }
      };

      // Log the actual payload being sent
      console.log('Payload being sent (handleAddSubmit):', communicationToSend);

      const response = await communicationService.createCommunication(communicationToSend);

      setCommunications([response.data, ...communications]);
      setShowAddModal(false);
      toast.success('Thêm bài viết thành công!');
    } catch (error) {
      console.error("Lỗi khi thêm bài viết:", error);
      const errorMsg = error.response?.data?.message || 'Thêm bài viết thất bại.';
      toast.error(errorMsg);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (uploadingImage) {
      toast.error("Vui lòng đợi quá trình tải ảnh lên hoàn tất.");
      return;
    }
    if (!selectedCommunication || !selectedCommunication.id) return;
    if (!selectedCommunication.officeId) {
      toast.error("Vui lòng chọn phòng ban/khoa.");
      return;
    }
    
    const originalStatus = selectedCommunication.status; // Store original status

    try {
      const communicationToSend = {
        ...selectedCommunication,
        imageUrl: selectedCommunication.image || null
      };
      delete communicationToSend.image;
      delete communicationToSend.office;
      delete communicationToSend.author;
      delete communicationToSend.authorName;
      delete communicationToSend.createdAt;
      delete communicationToSend.updatedAt;
      delete communicationToSend.publishedAt;
      delete communicationToSend.views;
      delete communicationToSend.shares;
      delete communicationToSend.approver;
      
      const response = await communicationService.updateCommunication(selectedCommunication.id, communicationToSend);
      
      // If original status was NEEDS_REVISION, automatically submit for approval
      if (originalStatus === 'NEEDS_REVISION') {
        try {
          const submittedComm = await communicationService.submitForApproval(response.data.id);
          setCommunications(communications.map(c => c.id === selectedCommunication.id ? submittedComm.data : c));
          toast.success('Cập nhật và gửi duyệt lại bài viết thành công!');
        } catch (submitError) {
          console.error("Lỗi khi gửi duyệt lại bài viết:", submitError);
          // Even if submit fails, update with the edited data first
          setCommunications(communications.map(c => c.id === selectedCommunication.id ? response.data : c));
          toast.warn('Cập nhật bài viết thành công, nhưng gửi duyệt lại thất bại. Vui lòng thử gửi duyệt thủ công.');
        }
      } else {
        setCommunications(communications.map(c => c.id === selectedCommunication.id ? response.data : c));
        toast.success('Cập nhật bài viết thành công!');
      }
      setShowEditModal(false);
    } catch (error) {
      console.error("Lỗi khi cập nhật bài viết:", error);
      toast.error(error.response?.data?.message || 'Cập nhật bài viết thất bại.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCommunication || !selectedCommunication.id) return;
    try {
      await communicationService.deleteCommunication(selectedCommunication.id);
      setCommunications(communications.filter(c => c.id !== selectedCommunication.id));
      setShowDeleteModal(false);
      toast.success('Xóa bài viết thành công!');
    } catch (error) {
      console.error("Lỗi khi xóa bài viết:", error);
      toast.error('Xóa bài viết thất bại.');
    }
  };

  const handleApproveConfirm = async () => {
    if (!selectedCommunication || !selectedCommunication.id) return;
    try {
      const response = await communicationService.approveCommunication(selectedCommunication.id);
      setCommunications(communications.map(c => c.id === selectedCommunication.id ? response.data : c));
      setShowApproveModal(false);
      toast.success('Phê duyệt bài viết thành công!');
    } catch (error) {
      console.error("Lỗi khi phê duyệt:", error);
      toast.error('Phê duyệt bài viết thất bại.');
    }
  };

  const handleRejectConfirm = async () => {
    if (!selectedCommunication || !selectedCommunication.id || !rejectReason.trim()) return;
    try {
      const response = await communicationService.rejectCommunication(selectedCommunication.id, rejectReason.trim());
      setCommunications(communications.map(c => c.id === selectedCommunication.id ? response.data : c));
      setShowRejectModal(false);
      toast.success('Từ chối bài viết thành công!');
    } catch (error) {
      console.error("Lỗi khi từ chối:", error);
      toast.error('Từ chối bài viết thất bại.');
    }
  };

  const handleUnapproveConfirm = async () => {
    if (!selectedCommunication || !selectedCommunication.id || !unapproveReason.trim()) {
      toast.error("Vui lòng nhập lý do hủy phê duyệt.");
      return;
    }
    try {
      const response = await communicationService.unapproveCommunication(selectedCommunication.id, unapproveReason.trim());
      setCommunications(communications.map(c => c.id === selectedCommunication.id ? response.data : c));
      setShowUnapproveModal(false);
      toast.success('Hủy phê duyệt bài viết thành công! Bài viết đã được chuyển sang trạng thái "Cần chỉnh sửa".');
    } catch (error) {
      console.error("Lỗi khi hủy phê duyệt:", error);
      toast.error(error.response?.data?.message || 'Hủy phê duyệt bài viết thất bại.');
    }
  };

  // --- Image Upload Handling (Adapted from Events.jsx) ---
  const handleImageUpload = async (file, commType = 'new') => {
    if (!file) return null;
    
    setUploadingImage(true);
    setUploadProgress(10);
    toast.info('Bắt đầu tải ảnh lên...'); // Optional user feedback
    
    try {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        throw new Error('Kích thước file quá lớn. Vui lòng chọn file nhỏ hơn 5MB.');
      }
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const next = prev + 15;
          return next < 90 ? next : prev; // Cap progress at 90 until complete
        });
      }, 300);
      
      const response = await imageService.uploadImage(file, file.name);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      if (response.success) {
        const imageUrl = response.data.display_url;
        toast.success('Tải ảnh lên thành công!');
        
        if (commType === 'new') {
          setNewCommunication(prev => ({ ...prev, image: imageUrl }));
        } else if (commType === 'edit') {
          setSelectedCommunication(prev => ({ ...prev, image: imageUrl, imageUrl: imageUrl })); // Update both image and imageUrl for consistency
        }
        
        return imageUrl;
      } else {
        throw new Error(response.message || 'Tải ảnh lên không thành công từ dịch vụ.');
      }
    } catch (err) {
      console.error('Lỗi khi tải ảnh lên:', err);
      toast.error(`Lỗi tải ảnh lên: ${err.message}`);
      setUploadProgress(0); // Reset progress on error
      return null;
    } finally {
      setUploadingImage(false);
      // Delay resetting progress slightly so user sees 100%
      setTimeout(() => setUploadProgress(0), 1000);
      // Reset file input
      if (commType === 'new' && newCommImageInputRef.current) {
        newCommImageInputRef.current.value = '';
      } else if (commType === 'edit' && editCommImageInputRef.current) {
        editCommImageInputRef.current.value = '';
      }
    }
  };
  
  const handleNewImageSelect = async (e) => {
    const file = e.target.files[0];
    if (file) {
      await handleImageUpload(file, 'new');
    }
  };
  
  const handleEditImageSelect = async (e) => {
    const file = e.target.files[0];
    if (file) {
      await handleImageUpload(file, 'edit');
    }
  };

  // --- UI Helpers --- 
  const getStatusText = (status) => {
    switch (status) {
      case 'PUBLISHED': return 'Đã đăng';
      case 'DRAFT': return 'Bản nháp';
      case 'PENDING': return 'Chờ duyệt';
      case 'REJECTED': return 'Bị từ chối';
      case 'NEEDS_REVISION': return 'Cần chỉnh sửa';
      default: return status;
    }
  };

  const getTypeText = (type) => {
      switch (type) {
          case 'NEWS': return 'Tin tức';
          case 'ANNOUNCEMENT': return 'Thông báo';
          case 'EVENT': return 'Sự kiện';
          default: return type;
      }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'PUBLISHED': return 'bg-green-100 text-green-800';
      case 'DRAFT': return 'bg-gray-100 text-gray-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'NEEDS_REVISION': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeBadgeColor = (type) => {
    switch (type) {
      case 'NEWS': return 'bg-blue-100 text-blue-800';
      case 'ANNOUNCEMENT': return 'bg-purple-100 text-purple-800';
      case 'EVENT': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý Truyền thông</h1>
        {currentUser && (currentUser.role === 'ADMIN' || currentUser.role === 'MANAGER' || currentUser.role === 'STAFF' || currentUser.role === 'ORGANIZER') && (
          <button
            onClick={openAddModal}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center"
          >
            <FaPlus className="mr-2" />
            Thêm mới
          </button>
        )}
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm theo tiêu đề, nội dung, tác giả, phòng ban..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>
        <div className="sm:w-48">
          <select
            className="w-full p-2 border rounded-lg"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">Tất cả loại</option>
            <option value="NEWS">Tin tức</option>
            <option value="ANNOUNCEMENT">Thông báo</option>
            <option value="EVENT">Sự kiện</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tiêu đề & Ngày tạo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loại
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tác giả & Phòng ban
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thống kê
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCommunications.map((comm) => (
                  <tr key={comm.id}>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {comm.imageUrl && (
                          <img
                            className="h-10 w-10 rounded-lg object-cover mr-3 flex-shrink-0"
                            src={comm.imageUrl}
                            alt={comm.title}
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900 truncate" title={comm.title}>{comm.title}</div>
                          <div className="text-sm text-gray-500">
                            Ngày tạo: {formatDate(comm.createdAt)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeBadgeColor(comm.type)}`}>
                        {getTypeText(comm.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{comm.authorName || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{comm.office?.name || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(comm.status)}`}>
                        {getStatusText(comm.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        <div>Lượt xem: {comm.views ?? 0}</div>
                        <div>Lượt chia sẻ: {comm.shares ?? 0}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex justify-end items-center space-x-2">
                        <button
                          className="text-gray-600 hover:text-gray-900 p-1"
                          title="Xem chi tiết"
                          onClick={() => openViewModal(comm)}
                        >
                          <FaEye />
                        </button>
                        {(currentUser && (comm.author?.id === currentUser.id && (comm.status === 'DRAFT' || comm.status === 'REJECTED' || comm.status === 'NEEDS_REVISION')) || currentUser.role === 'ADMIN' || currentUser.role === 'MANAGER') && (
                          <button
                            className="text-indigo-600 hover:text-indigo-900 p-1"
                            title="Chỉnh sửa"
                            onClick={() => openEditModal(comm)}
                          >
                            <FaEdit />
                          </button>
                        )}
                        {(currentUser && currentUser.role === 'ADMIN' || (comm.author?.id === currentUser.id && (comm.status === 'DRAFT' || comm.status === 'REJECTED' || comm.status === 'NEEDS_REVISION'))) && (
                          <button
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Xóa"
                            onClick={() => openDeleteModal(comm)}
                          >
                            <FaTrash />
                          </button>
                        )}
                        {(currentUser && (currentUser.role === 'ADMIN' || currentUser.role === 'MANAGER')) && comm.status === 'PENDING' && (
                          <>
                            <button
                              className="text-green-600 hover:text-green-900 p-1"
                              title="Phê duyệt"
                              onClick={() => openApproveModal(comm)}
                            >
                              <FaCheck />
                            </button>
                            <button
                              className="text-red-600 hover:text-red-900 p-1"
                              title="Từ chối"
                              onClick={() => openRejectModal(comm)}
                            >
                              <FaTimes />
                            </button>
                          </>
                        )}
                        {(currentUser && (currentUser.role === 'ADMIN' || currentUser.role === 'MANAGER')) && comm.status === 'PUBLISHED' && (
                            <button
                              className="text-orange-600 hover:text-orange-900 p-1"
                              title="Hủy phê duyệt"
                              onClick={() => openUnapproveModal(comm)}
                            >
                              <FaUndo />
                            </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 md:top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Thêm bài viết mới</h3>
              <form onSubmit={handleAddSubmit}>
                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tiêu đề *</label>
                    <input
                      type="text"
                      name="title"
                      value={newCommunication.title}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Loại *</label>
                    <select
                      name="type"
                      value={newCommunication.type}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      <option value="NEWS">Tin tức</option>
                      <option value="ANNOUNCEMENT">Thông báo</option>
                      <option value="EVENT">Sự kiện</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nội dung *</label>
                    <textarea
                      name="content"
                      value={newCommunication.content}
                      onChange={handleInputChange}
                      rows={6}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Hình ảnh</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
                      <div>
                        <input
                          type="file"
                          id="new-image-upload"
                          accept="image/*"
                          onChange={handleNewImageSelect}
                          ref={newCommImageInputRef}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 disabled:opacity-50"
                          disabled={uploadingImage}
                        />
                        <p className="mt-1 text-xs text-gray-500">Tải lên hình ảnh (tối đa 5MB).</p>
                        {uploadingImage && (
                          <div className="mt-2">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Đang tải lên... {uploadProgress}%</p>
                          </div>
                        )}
                      </div>
                      <div>
                        <input
                          type="url"
                          name="image"
                          value={newCommunication.image}
                          onChange={handleInputChange}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:opacity-50"
                          placeholder="Hoặc nhập URL hình ảnh..."
                          disabled={uploadingImage}
                        />
                        {newCommunication.image && (
                          <div className="mt-2">
                            <img 
                              src={newCommunication.image} 
                              alt="Xem trước" 
                              className="h-20 w-auto object-cover rounded-md border border-gray-200"
                              onError={(e) => { e.target.onerror = null; e.target.style.display='none'; /* Hide broken image */ }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phòng ban/Khoa *</label>
                    <select
                      name="officeId"
                      value={newCommunication.officeId}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    >
                      <option value="" disabled>-- Chọn phòng ban --</option>
                      {offices.map(office => (
                        <option key={office.id} value={office.id}>
                          {office.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mt-5 flex justify-end space-x-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-24 hover:bg-gray-600"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white text-base font-medium rounded-md w-24 hover:bg-indigo-700 disabled:opacity-50"
                    disabled={!newCommunication.title || !newCommunication.content || !newCommunication.officeId || uploadingImage}
                  >
                    {uploadingImage ? 'Đang tải ảnh...' : 'Thêm'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showEditModal && selectedCommunication && (
         <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 md:top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Chỉnh sửa bài viết</h3>
              <form onSubmit={handleEditSubmit}>
                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tiêu đề *</label>
                    <input
                      type="text"
                      name="title"
                      value={selectedCommunication.title}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Loại *</label>
                    <select
                      name="type"
                      value={selectedCommunication.type}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      <option value="NEWS">Tin tức</option>
                      <option value="ANNOUNCEMENT">Thông báo</option>
                      <option value="EVENT">Sự kiện</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nội dung *</label>
                    <textarea
                      name="content"
                      value={selectedCommunication.content}
                      onChange={handleInputChange}
                      rows={6}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Hình ảnh</label>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
                      <div>
                        <input
                          type="file"
                          id="edit-image-upload"
                          accept="image/*"
                          onChange={handleEditImageSelect}
                          ref={editCommImageInputRef}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 disabled:opacity-50"
                          disabled={uploadingImage}
                        />
                        <p className="mt-1 text-xs text-gray-500">Tải lên hình ảnh mới (tối đa 5MB).</p>
                         {uploadingImage && (
                          <div className="mt-2">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Đang tải lên... {uploadProgress}%</p>
                          </div>
                        )}
                      </div>
                      <div>
                        <input
                          type="url"
                          name="image"
                          value={selectedCommunication.image || ''}
                          onChange={handleInputChange}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:opacity-50"
                          placeholder="Hoặc nhập URL hình ảnh..."
                          disabled={uploadingImage}
                        />
                        {selectedCommunication.image && (
                          <div className="mt-2">
                            <img 
                              src={selectedCommunication.image} 
                              alt="Hình ảnh hiện tại" 
                              className="h-20 w-auto object-cover rounded-md border border-gray-200"
                              onError={(e) => { e.target.onerror = null; e.target.style.display='none'; }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phòng ban/Khoa *</label>
                    <select
                      name="officeId"
                      value={selectedCommunication.officeId}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    >
                      <option value="" disabled>-- Chọn phòng ban --</option>
                      {offices.map(office => (
                        <option key={office.id} value={office.id}>
                          {office.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {(currentUser?.role === 'ADMIN' || currentUser?.role === 'MANAGER') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Trạng thái (Quản trị)</label>
                      <select
                        name="status"
                        value={selectedCommunication.status}
                        onChange={handleInputChange} 
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      >
                        <option value="DRAFT">Bản nháp</option>
                        <option value="PENDING">Chờ duyệt</option>
                        <option value="PUBLISHED">Đã đăng</option>
                        <option value="REJECTED">Bị từ chối</option>
                      </select>
                    </div>
                  )}
                </div>
                <div className="mt-5 flex justify-end space-x-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-24 hover:bg-gray-600"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white text-base font-medium rounded-md w-24 hover:bg-indigo-700 disabled:opacity-50"
                    disabled={!selectedCommunication.title || !selectedCommunication.content || !selectedCommunication.officeId || uploadingImage}
                  >
                    {uploadingImage ? 'Đang tải ảnh...' : 'Lưu'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showViewModal && selectedCommunication && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 md:top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-start mb-4 pb-3 border-b">
                <h3 className="text-lg font-medium text-gray-900">Chi tiết bài viết</h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Đóng</span>
                  <FaTimes className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-2 space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                {selectedCommunication.imageUrl && (
                  <img
                    src={selectedCommunication.imageUrl}
                    alt={selectedCommunication.title}
                    className="w-full h-64 object-cover rounded-lg mb-4"
                  />
                )}
                <div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">{selectedCommunication.title}</h4>
                  <div className="text-sm text-gray-500 mb-3">
                    <span>Đăng bởi: {selectedCommunication.authorName || 'N/A'}</span>
                    <span className="mx-2">|</span>
                    <span>Phòng ban: {selectedCommunication.office?.name || 'N/A'}</span>
                     <span className="mx-2">|</span>
                    <span>Ngày tạo: {formatDate(selectedCommunication.createdAt)}</span>
                    {selectedCommunication.publishedAt && 
                      <><span className="mx-2">|</span><span>Ngày đăng: {formatDate(selectedCommunication.publishedAt)}</span></>}
                  </div>
                </div>
                <div className="flex space-x-4 mb-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadgeColor(selectedCommunication.type)}`}>
                    {getTypeText(selectedCommunication.type)}
                  </span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(selectedCommunication.status)}`}>
                    {getStatusText(selectedCommunication.status)}
                  </span>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-gray-900 mb-1">Nội dung</h5>
                  <p className="mt-1 text-sm text-gray-600 whitespace-pre-wrap">{selectedCommunication.content}</p> 
                </div>
                {selectedCommunication.status === 'REJECTED' && selectedCommunication.rejectReason && (
                  <div className='mt-4 p-3 bg-red-50 border border-red-200 rounded'>
                    <p className='text-sm font-medium text-red-700'>Lý do từ chối:</p>
                    <p className='text-sm text-red-600'>{selectedCommunication.rejectReason}</p>
                  </div>
                )}
                {selectedCommunication.status === 'NEEDS_REVISION' && selectedCommunication.rejectReason && (
                  <div className='mt-4 p-3 bg-orange-50 border border-orange-200 rounded'>
                    <p className='text-sm font-medium text-orange-700'>Lý do hủy phê duyệt/Yêu cầu chỉnh sửa:</p>
                    <p className='text-sm text-orange-600'>{selectedCommunication.rejectReason}</p>
                  </div>
                )}
                <div className="flex justify-end text-sm text-gray-500 pt-4 border-t mt-4">
                  <span>Lượt xem: {selectedCommunication.views ?? 0}</span>
                  <span className="ml-4">Lượt chia sẻ: {selectedCommunication.shares ?? 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && selectedCommunication && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <FaTrash className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">Xác nhận xóa</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Bạn có chắc chắn muốn xóa bài viết "<span className="font-semibold">{selectedCommunication.title}</span>" không? Hành động này không thể hoàn tác.
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
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md w-24 hover:bg-red-700"
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showApproveModal && selectedCommunication && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <FaCheck className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">Xác nhận phê duyệt</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Bạn có chắc chắn muốn phê duyệt và đăng bài viết "<span className="font-semibold">{selectedCommunication.title}</span>" không?
                </p>
              </div>
              <div className="mt-5 px-7 py-3 flex justify-center space-x-3">
                <button
                  onClick={() => setShowApproveModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md w-24 hover:bg-gray-400"
                >
                  Hủy
                </button>
                <button
                  onClick={handleApproveConfirm}
                  className="px-4 py-2 bg-green-600 text-white text-base font-medium rounded-md w-24 hover:bg-green-700"
                >
                  Duyệt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showRejectModal && selectedCommunication && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="mt-3">
               <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                 <FaTimes className="h-6 w-6 text-red-600" />
               </div>
              <h3 className="text-lg font-medium text-gray-900 text-center">Từ chối bài viết</h3>
              <p className="text-sm text-center text-gray-600 mb-4">"<span className="font-semibold">{selectedCommunication.title}</span>"</p>
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700">
                  Lý do từ chối * 
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Nhập lý do từ chối..."
                  required
                />
              </div>
              <div className="mt-5 flex justify-center space-x-3">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md w-24 hover:bg-gray-400"
                >
                  Hủy
                </button>
                <button
                  onClick={handleRejectConfirm}
                  className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md w-24 hover:bg-red-700 disabled:opacity-50"
                  disabled={!rejectReason.trim()}
                >
                  Từ chối
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showUnapproveModal && selectedCommunication && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="mt-3">
               <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-orange-100 mb-4">
                 <FaUndo className="h-6 w-6 text-orange-600" />
               </div>
              <h3 className="text-lg font-medium text-gray-900 text-center">Hủy Phê Duyệt Bài Viết</h3>
              <p className="text-sm text-center text-gray-600 mb-4">"<span className="font-semibold">{selectedCommunication.title}</span>"</p>
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700">
                  Lý do hủy phê duyệt/Yêu cầu chỉnh sửa * 
                </label>
                <textarea
                  value={unapproveReason}
                  onChange={(e) => setUnapproveReason(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Nhập lý do..."
                  required
                />
              </div>
              <div className="mt-5 flex justify-center space-x-3">
                <button
                  onClick={() => setShowUnapproveModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md w-auto hover:bg-gray-400"
                >
                  Hủy
                </button>
                <button
                  onClick={handleUnapproveConfirm}
                  className="px-4 py-2 bg-orange-600 text-white text-base font-medium rounded-md w-auto hover:bg-orange-700 disabled:opacity-50"
                  disabled={!unapproveReason.trim()}
                >
                  Xác nhận Hủy Phê Duyệt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Communications; 