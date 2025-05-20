import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaPlus, FaSearch, FaCheck, FaTimes, FaEye } from 'react-icons/fa';
import authService from '../services/auth.service';
import { eventReportService, eventService } from '../services';
import { toast } from 'react-toastify';
import imageService from '../services/imageService';

const EventReports = () => {
  // State for reports data and UI controls
  const [reports, setReports] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  
  // Selected report and form data
  const [selectedReport, setSelectedReport] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [newReport, setNewReport] = useState({
    eventId: '',
    organizer: '',
    date: '',
    location: '',
    attendees: '',
    summary: '',
    outcomes: '',
    challenges: '',
    recommendations: '',
    attachments: [],
    status: 'pending',
    submittedBy: ''
  });

  // Move fetchData outside of useEffect so it can be reused
  const fetchData = async () => {
    setLoading(true);
    try {
      const [reportsData, eventsData] = await Promise.all([
        eventReportService.getAllReports(),
        eventService.getAllEvents()
      ]);
      
      setReports(Array.isArray(reportsData) ? reportsData : []);
      setEvents(Array.isArray(eventsData) ? eventsData : []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Không thể tải dữ liệu báo cáo hoặc sự kiện');
      setReports([]);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchData();
  }, []);

  // Filter reports based on search term and status
  const filteredReports = reports.filter(report => {
    if (!report) return false; // Skip if report is undefined
    
    const matchesSearch = (
      (report.eventName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (report.organizer || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (report.department || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Get current user
  const currentUser = authService.getCurrentUser();
  const userRole = currentUser?.role || 'STAFF';
  const username = currentUser?.username || '';
  const userId = currentUser?.id;

  // Check user permissions
  const canApprove = ['ADMIN', 'MANAGER'].includes(userRole);
  const canEdit = ['ADMIN', 'ORGANIZER'].includes(userRole);
  const canDelete = ['ADMIN'].includes(userRole);

  // Handle input changes for new/edit report
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'eventId') {
      const selectedEvent = events.find(event => event.id.toString() === value);
      setNewReport(prev => ({
        ...prev,
        eventId: value,
        organizer: selectedEvent ? selectedEvent.organizer : '' // Auto-fill organizer
      }));
    } else {
      setNewReport(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Update handleFileChange to store actual files instead of just names
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setNewReport(prev => ({
      ...prev,
      attachments: files // Store the actual file objects
    }));
  };

  // Add function to handle file downloads
  const handleFileDownload = async (fileName) => {
    try {
      const blob = await eventReportService.downloadAttachment(fileName);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Không thể tải file. Vui lòng thử lại sau.');
    }
  };

  // Add new report
  const handleAddReport = async () => {
    // Client-side validation (basic example, expand as needed)
    if (!newReport.eventId) {
      toast.error('Vui lòng chọn một sự kiện.');
      return;
    }
    if (!newReport.date) {
      toast.error('Ngày báo cáo không được để trống.');
      return;
    }
    if (!newReport.summary.trim()) {
      toast.error('Tóm tắt sự kiện không được để trống.');
      return;
    }
    // Add more validations as necessary

    try {
      setLoading(true);
      let uploadedAttachmentNames = [];

      // Check if there are new files to upload
      const filesToUpload = newReport.attachments.filter(att => att instanceof File);

      if (filesToUpload.length > 0) {
        toast.info('Đang tải tệp đính kèm...');
        // Assuming imageService.uploadImage can handle an array of files or we call it per file
        // For simplicity, let's assume it handles one file at a time and returns a name/URL string
        // You might need a dedicated multi-file upload service or loop this call
        for (const file of filesToUpload) {
          // Placeholder: imageService.uploadImage might need to be adapted or replaced
          // if it only handles single images or specific types.
          // For now, let's assume it takes a file and returns an object like { success: true, data: { display_url: "filename_or_url" } }
          // or simply a string if it's a simpler service.
          // This part is highly dependent on your actual `imageService.uploadImage` or a new `fileUploadService`.
          
          // SIMPLIFIED: Assuming imageService.uploadImage can take one file and returns { data: "uploaded_file_name_or_url" } or similar
          // This is a MOCK an needs to be replaced with your actual multi-file upload logic.
          // For a real multi-file upload, you'd typically use FormData and a dedicated endpoint.
          // The existing imageService.uploadImage might be for single profile/event images.
          // We will use a direct call to a hypothetical service function for clarity.

          // Let's assume you have an imageService that handles one file and returns a name
          // This is a conceptual change. Your imageService.uploadImage might need adjustment
          // or you need a new service like `fileAttachmentService.uploadAttachments(filesToUpload)`
          // which would return an array of names/URLs.

          // Using a loop for conceptual clarity - this might not be efficient or practical
          // depending on your actual imageService.
          try {
            const uploadResponse = await imageService.uploadImage(file, file.name); // Using existing imageService as placeholder
            if (uploadResponse.success && uploadResponse.data.display_url) {
              uploadedAttachmentNames.push(uploadResponse.data.display_url);
            } else {
              throw new Error(uploadResponse.message || 'Một tệp tải lên thất bại.');
            }
          } catch (uploadError) {
            console.error("Lỗi tải tệp đính kèm:", uploadError);
            toast.error(`Lỗi tải tệp: ${file.name}. ${uploadError.message}`);
            setLoading(false);
            return; // Stop if any file fails
          }
        }
      }

      const reportData = {
        ...newReport,
        attachments: uploadedAttachmentNames, // Now only contains string names/URLs
        submittedBy: username
      };
      
      await eventReportService.createReport(reportData); // Backend expects string attachments
      setShowAddModal(false);
      toast.success('Báo cáo đã được tạo thành công');
      setNewReport({
        eventId: '',
        organizer: '',
        date: '',
        location: '',
        attendees: '',
        summary: '',
        outcomes: '',
        challenges: '',
        recommendations: '',
        attachments: [], // Reset to empty array for new files
        status: 'pending',
        submittedBy: ''
      });
      await fetchData();
    } catch (error) {
      console.error('Error creating report:', error);
      toast.error('Không thể tạo báo cáo');
    } finally {
      setLoading(false);
    }
  };

  // Edit report
  const handleEditReport = async () => {
    // Client-side validation
    if (!newReport.eventId) { /* ... similar validations as add ... */ return; }
    if (!newReport.date) { /* ... */ return; }
    if (!newReport.summary.trim()) { /* ... */ return; }

    try {
      setLoading(true);
      let finalAttachmentList = [];

      // Separate existing string attachments from new File objects
      const existingStringAttachments = newReport.attachments.filter(att => typeof att === 'string');
      const newFilesToUpload = newReport.attachments.filter(att => att instanceof File);

      finalAttachmentList.push(...existingStringAttachments);

      if (newFilesToUpload.length > 0) {
        toast.info('Đang tải tệp đính kèm mới...');
        for (const file of newFilesToUpload) {
          try {
            // Again, using imageService.uploadImage as a placeholder
            const uploadResponse = await imageService.uploadImage(file, file.name); 
            if (uploadResponse.success && uploadResponse.data.display_url) {
              finalAttachmentList.push(uploadResponse.data.display_url);
            } else {
              throw new Error(uploadResponse.message || 'Một tệp tải lên thất bại.');
            }
          } catch (uploadError) {
            console.error("Lỗi tải tệp đính kèm mới:", uploadError);
            toast.error(`Lỗi tải tệp mới: ${file.name}. ${uploadError.message}`);
            setLoading(false);
            return; 
          }
        }
      }

      const reportData = {
        ...newReport, // newReport should hold the edited fields
        attachments: finalAttachmentList, // Contains old strings + new strings from upload
        submittedBy: username // Or original submitter if that's the logic
      };
      
      await eventReportService.updateReport(selectedReport.id, reportData);
      setShowEditModal(false);
      setSelectedReport(null);
      toast.success('Báo cáo đã được cập nhật thành công');
      await fetchData();
    } catch (error) {
      console.error('Error updating report:', error);
      toast.error('Không thể cập nhật báo cáo');
    } finally {
      setLoading(false);
    }
  };

  // Delete report
  const handleDeleteReport = async () => {
    try {
      setLoading(true);
      await eventReportService.deleteReport(selectedReport.id);
      setShowDeleteModal(false);
      setSelectedReport(null);
      toast.success('Báo cáo đã được xóa thành công');
      // Refresh data after deleting report
      await fetchData();
    } catch (error) {
      console.error('Error deleting report:', error);
      toast.error('Không thể xóa báo cáo');
    } finally {
      setLoading(false);
    }
  };

  // Approve report
  const handleApproveReport = async () => {
    try {
      setLoading(true);
      await eventReportService.approveReport(selectedReport.id, userId);
      setShowApproveModal(false);
      setSelectedReport(null);
      toast.success('Báo cáo đã được phê duyệt thành công');
      // Refresh data after approving report
      await fetchData();
    } catch (error) {
      console.error('Error approving report:', error);
      toast.error('Không thể phê duyệt báo cáo');
    } finally {
      setLoading(false);
    }
  };

  // Reject report
  const handleRejectReport = async () => {
    if (!rejectReason.trim()) {
      toast.error('Vui lòng nhập lý do từ chối');
      return;
    }

    try {
      setLoading(true);
      await eventReportService.rejectReport(selectedReport.id, rejectReason, userId);
      setShowRejectModal(false);
      setSelectedReport(null);
      setRejectReason('');
      toast.success('Báo cáo đã bị từ chối');
      // Refresh data after rejecting report
      await fetchData();
    } catch (error) {
      console.error('Error rejecting report:', error);
      toast.error('Không thể từ chối báo cáo');
    } finally {
      setLoading(false);
    }
  };

  // Open edit modal
  const openEditModal = (report) => {
    setSelectedReport(report);
    setNewReport(report);
    setShowEditModal(true);
  };

  // Open view modal
  const openViewModal = (report) => {
    setSelectedReport(report);
    setShowViewModal(true);
  };

  // Open delete modal
  const openDeleteModal = (report) => {
    setSelectedReport(report);
    setShowDeleteModal(true);
  };

  // Open approve modal
  const openApproveModal = (report) => {
    setSelectedReport(report);
    setShowApproveModal(true);
  };

  // Open reject modal
  const openRejectModal = (report) => {
    setSelectedReport(report);
    setShowRejectModal(true);
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status display text
  const getStatusText = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'Đã duyệt';
      case 'REJECTED':
        return 'Bị từ chối (cần sửa)';
      case 'PENDING':
        return 'Chờ duyệt';
      default:
        return status;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý Báo cáo Sự kiện</h1>
        {(canEdit || userRole === 'ADMIN' || userRole === 'STAFF' || userRole === 'MANAGER') && (
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center"
          >
            <FaPlus className="mr-2" />
            Thêm báo cáo mới
          </button>
        )}
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm theo tên sự kiện, đơn vị tổ chức..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>
          <div className="w-full md:w-48">
            <select
              className="w-full p-2 border rounded-lg focus:outline-none focus:border-indigo-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ duyệt</option>
              <option value="approved">Đã duyệt</option>
              <option value="rejected">Từ chối</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <>
          {/* Reports Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sự kiện
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Đơn vị tổ chức
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày diễn ra
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Người nộp
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredReports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{report.eventName}</div>
                        <div className="text-sm text-gray-500">ID: {report.eventId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{report.organizer}</div>
                        <div className="text-sm text-gray-500">{report.department}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {report.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(report.status)}`}>
                          {getStatusText(report.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{report.submittedBy}</div>
                        <div className="text-sm text-gray-500">{report.submittedDate}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => openViewModal(report)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                          title="Xem chi tiết"
                        >
                          <FaEye />
                        </button>
                        
                        {((report.status === 'PENDING' && canEdit) || (report.status === 'REJECTED' && (canEdit || report.submittedBy === username))) && (
                          <button
                            onClick={() => openEditModal(report)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                            title="Chỉnh sửa"
                          >
                            <FaEdit />
                          </button>
                        )}
                        
                        {(canApprove || userRole === 'ADMIN') && report.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => openApproveModal(report)}
                              className="text-green-600 hover:text-green-900 mr-3"
                              title="Phê duyệt"
                            >
                              <FaCheck />
                            </button>
                            <button
                              onClick={() => openRejectModal(report)}
                              className="text-red-600 hover:text-red-900 mr-3"
                              title="Từ chối"
                            >
                              <FaTimes />
                            </button>
                          </>
                        )}
                        
                        {canDelete && (
                          <button
                            onClick={() => openDeleteModal(report)}
                            className="text-red-600 hover:text-red-900"
                            title="Xóa"
                          >
                            <FaTrash />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* No Results Message */}
          {filteredReports.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Không tìm thấy báo cáo nào</p>
            </div>
          )}
        </>
      )}

      {/* Add/Edit Report Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {showAddModal ? 'Thêm báo cáo mới' : 'Chỉnh sửa báo cáo'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                  setNewReport({
                    eventId: '',
                    organizer: '',
                    date: '',
                    location: '',
                    attendees: '',
                    summary: '',
                    outcomes: '',
                    challenges: '',
                    recommendations: '',
                    attachments: [],
                    status: 'pending',
                    submittedBy: ''
                  });
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>

            <div className="mt-2">
              <form onSubmit={(e) => {
                e.preventDefault();
                if (showAddModal) {
                  handleAddReport();
                } else {
                  handleEditReport();
                }
              }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Chọn sự kiện
                    </label>
                    <select
                      name="eventId"
                      value={newReport.eventId}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                      disabled={showEditModal}
                    >
                      <option value="">-- Chọn sự kiện --</option>
                      {events.map(event => (
                        <option key={event.id} value={event.id}>
                          {event.title} (ID: {event.id})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Đơn vị tổ chức
                    </label>
                    <input
                      type="text"
                      name="organizer"
                      value={newReport.organizer}
                      readOnly
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Ngày báo cáo
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={newReport.date}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Địa điểm
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={newReport.location}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Số người tham dự
                    </label>
                    <input
                      type="number"
                      name="attendees"
                      value={newReport.attendees}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Tóm tắt sự kiện
                    </label>
                    <textarea
                      name="summary"
                      value={newReport.summary}
                      onChange={handleInputChange}
                      rows="3"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    ></textarea>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Kết quả đạt được
                    </label>
                    <textarea
                      name="outcomes"
                      value={newReport.outcomes}
                      onChange={handleInputChange}
                      rows="3"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    ></textarea>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Khó khăn, thách thức
                    </label>
                    <textarea
                      name="challenges"
                      value={newReport.challenges}
                      onChange={handleInputChange}
                      rows="3"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    ></textarea>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Đề xuất, kiến nghị
                    </label>
                    <textarea
                      name="recommendations"
                      value={newReport.recommendations}
                      onChange={handleInputChange}
                      rows="3"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    ></textarea>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Tệp đính kèm
                    </label>
                    <input
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      className="mt-1 block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-semibold
                        file:bg-indigo-50 file:text-indigo-700
                        hover:file:bg-indigo-100"
                    />
                  </div>
                </div>

                <div className="mt-5 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setShowEditModal(false);
                      setNewReport({
                        eventId: '',
                        organizer: '',
                        date: '',
                        location: '',
                        attendees: '',
                        summary: '',
                        outcomes: '',
                        challenges: '',
                        recommendations: '',
                        attachments: [],
                        status: 'pending',
                        submittedBy: ''
                      });
                    }}
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="bg-indigo-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    {showAddModal ? 'Thêm báo cáo' : 'Cập nhật'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Report Modal */}
      {showViewModal && selectedReport && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Chi tiết báo cáo
              </h3>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedReport(null);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>

            <div className="mt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Mã sự kiện</h4>
                  <p className="mt-1 text-sm text-gray-900">{selectedReport.eventId}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500">Tên sự kiện</h4>
                  <p className="mt-1 text-sm text-gray-900">{selectedReport.eventName}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500">Đơn vị tổ chức</h4>
                  <p className="mt-1 text-sm text-gray-900">{selectedReport.organizer}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500">Ngày báo cáo</h4>
                  <p className="mt-1 text-sm text-gray-900">{selectedReport.date}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500">Địa điểm</h4>
                  <p className="mt-1 text-sm text-gray-900">{selectedReport.location}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500">Số người tham dự</h4>
                  <p className="mt-1 text-sm text-gray-900">{selectedReport.attendees}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500">Trạng thái</h4>
                  <span className={`mt-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(selectedReport.status)}`}>
                    {getStatusText(selectedReport.status)}
                  </span>
                </div>

                <div className="md:col-span-2">
                  <h4 className="text-sm font-medium text-gray-500">Tóm tắt sự kiện</h4>
                  <p className="mt-1 text-sm text-gray-900">{selectedReport.summary}</p>
                </div>

                <div className="md:col-span-2">
                  <h4 className="text-sm font-medium text-gray-500">Kết quả đạt được</h4>
                  <p className="mt-1 text-sm text-gray-900">{selectedReport.outcomes}</p>
                </div>

                <div className="md:col-span-2">
                  <h4 className="text-sm font-medium text-gray-500">Khó khăn, thách thức</h4>
                  <p className="mt-1 text-sm text-gray-900">{selectedReport.challenges}</p>
                </div>

                <div className="md:col-span-2">
                  <h4 className="text-sm font-medium text-gray-500">Đề xuất, kiến nghị</h4>
                  <p className="mt-1 text-sm text-gray-900">{selectedReport.recommendations}</p>
                </div>

                <div className="md:col-span-2">
                  <h4 className="text-sm font-medium text-gray-500">Tệp đính kèm</h4>
                  <div className="mt-1 text-sm text-gray-900">
                    {(selectedReport.attachments || []).length > 0 ? (
                      <ul className="list-disc list-inside">
                        {(selectedReport.attachments || []).map((file, index) => (
                          <li key={index}>
                            <button
                              onClick={() => handleFileDownload(file)}
                              className="text-indigo-600 hover:text-indigo-800 hover:underline"
                            >
                              {file}
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>Không có tệp đính kèm.</p>
                    )}
                  </div>
                </div>

                {selectedReport.status === 'APPROVED' && (
                  <>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Người phê duyệt</h4>
                      <p className="mt-1 text-sm text-gray-900">{selectedReport.approvedBy}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Ngày phê duyệt</h4>
                      <p className="mt-1 text-sm text-gray-900">{selectedReport.approvedDate}</p>
                    </div>
                  </>
                )}

                {selectedReport.status === 'REJECTED' && (
                  <>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Người từ chối</h4>
                      <p className="mt-1 text-sm text-gray-900">{selectedReport.rejectedBy}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Ngày từ chối</h4>
                      <p className="mt-1 text-sm text-gray-900">{selectedReport.rejectedDate}</p>
                    </div>
                    {selectedReport.rejectReason && (
                       <div className="md:col-span-2">
                        <h4 className="text-sm font-medium text-gray-500">Lý do từ chối</h4>
                        <p className="mt-1 text-sm text-gray-900">{selectedReport.rejectReason}</p>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="mt-5 flex justify-end">
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedReport(null);
                  }}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Report Modal */}
      {showDeleteModal && selectedReport && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Xác nhận xóa</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Bạn có chắc chắn muốn xóa báo cáo này? Hành động này không thể hoàn tác.
                </p>
              </div>
              <div className="mt-4 flex justify-center space-x-4">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedReport(null);
                  }}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Hủy
                </button>
                <button
                  onClick={handleDeleteReport}
                  className="bg-red-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approve Report Modal */}
      {showApproveModal && selectedReport && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Xác nhận phê duyệt</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Bạn có chắc chắn muốn phê duyệt báo cáo này?
                </p>
              </div>
              <div className="mt-4 flex justify-center space-x-4">
                <button
                  onClick={() => {
                    setShowApproveModal(false);
                    setSelectedReport(null);
                  }}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Hủy
                </button>
                <button
                  onClick={handleApproveReport}
                  className="bg-green-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Phê duyệt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Report Modal */}
      {showRejectModal && selectedReport && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg leading-6 font-medium text-gray-900 text-center">Từ chối báo cáo</h3>
              <div className="mt-2 px-7 py-3">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Lý do từ chối
                  </label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows="3"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Nhập lý do từ chối..."
                    required
                  ></textarea>
                </div>
              </div>
              <div className="mt-4 flex justify-center space-x-4">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setSelectedReport(null);
                    setRejectReason('');
                  }}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Hủy
                </button>
                <button
                  onClick={handleRejectReport}
                  disabled={!rejectReason.trim()}
                  className={`py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${
                    rejectReason.trim() 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-red-400 cursor-not-allowed'
                  }`}
                >
                  Từ chối
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventReports;
