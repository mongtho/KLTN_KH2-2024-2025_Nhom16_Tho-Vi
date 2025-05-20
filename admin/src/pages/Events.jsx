import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import eventService from '../services/eventService';
import imageService from '../services/imageService';
import { authService } from '../services';
import userService from '../services/user.service';
import departmentService from '../services/department.service';
import officeService from '../services/office.service';
import toast, { Toaster } from 'react-hot-toast';

// --- User Selection Modal Component (Simplified inline for now) ---
const UserSelectionModal = ({
  isOpen,
  onClose,
  allUsers = [],
  allDepartments = [],
  allOffices = [],
  initialSelectedIds = [],
  onConfirm,
  isLoading,
}) => {
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedOffice, setSelectedOffice] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState(new Set(initialSelectedIds));

  useEffect(() => {
    // Reset selection when modal opens with new initial IDs
    setSelectedUserIds(new Set(initialSelectedIds));
  }, [initialSelectedIds, isOpen]);

  const handleUserSelect = (userId) => {
    setSelectedUserIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const filteredUsers = allUsers.filter(user => {
    const matchesDepartment = !selectedDepartment || user.department?.id === parseInt(selectedDepartment);
    const matchesOffice = !selectedOffice || user.office?.id === parseInt(selectedOffice);
    const matchesSearch = !searchTerm || 
                          user.username?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesDepartment && matchesOffice && matchesSearch;
  });

  const handleConfirm = () => {
    onConfirm(Array.from(selectedUserIds));
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full p-6 m-4 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Chọn Ban tổ chức</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
             <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <select 
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="">Tất cả Khoa</option>
            {allDepartments.map(dept => <option key={dept.id} value={dept.id}>{dept.name}</option>)}
          </select>
          <select 
             value={selectedOffice}
             onChange={(e) => setSelectedOffice(e.target.value)}
             className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="">Tất cả Phòng Ban</option>
            {allOffices.map(office => <option key={office.id} value={office.id}>{office.name}</option>)}
          </select>
          <input 
            type="text" 
            placeholder="Tìm theo tên hoặc email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        {/* User List */}
        <div className="flex-grow overflow-y-auto border border-gray-200 rounded-md mb-4">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">Chọn</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên đăng nhập</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khoa</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phòng ban</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr><td colSpan="5" className="text-center py-4">Đang tải...</td></tr>
              ) : filteredUsers.length === 0 ? (
                 <tr><td colSpan="5" className="text-center py-4">Không tìm thấy người dùng phù hợp.</td></tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className={`${selectedUserIds.has(user.id) ? 'bg-indigo-50' : 'hover:bg-gray-50'}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input 
                        type="checkbox" 
                        checked={selectedUserIds.has(user.id)}
                        onChange={() => handleUserSelect(user.id)}
                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.username}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.department?.name || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.office?.name || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
         {/* Selected Count and Action Buttons */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
           <span className="text-sm text-gray-600">Đã chọn: {selectedUserIds.size} người</span>
           <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="bg-white border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              onClick={handleConfirm}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md shadow-sm"
            >
              Xác nhận
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
// --- End User Selection Modal --- 

// --- Rejection Reason Modal Component ---
const RejectionReasonModal = ({ isOpen, onClose, onSubmit, reason, setReason, loading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-[70] p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 m-4">
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Lý do từ chối / Yêu cầu chỉnh sửa</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500" disabled={loading}>
             <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <textarea
          rows="4"
          className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Nhập lý do từ chối/yêu cầu chỉnh sửa..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          disabled={loading}
        />
        <div className="flex justify-end space-x-3 mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="bg-white border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md hover:bg-gray-50 disabled:opacity-50"
            disabled={loading}
          >
            Hủy
          </button>
          <button
            onClick={onSubmit}
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md shadow-sm disabled:opacity-50"
            disabled={loading || !reason.trim()}
          >
            {loading ? 'Đang xử lý...' : 'Xác nhận từ chối'}
          </button>
        </div>
      </div>
    </div>
  );
};
// --- End Rejection Reason Modal ---

const Events = () => {
  const navigate = useNavigate();
  const [allEvents, setAllEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [organizerFilter, setOrganizerFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    location: '',
    startDate: '',
    endDate: '',
    organizer: '',
    organizerIds: [],
    capacity: 100,
    image: '',
    targetAudience: '- Giảng viên quan tâm\n- Sinh viên các ngành CNTT',
    speaker: '',
    travelPlan: '',
    transportation: ''
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [eventToApprove, setEventToApprove] = useState(null);
  const [eventToReject, setEventToReject] = useState(null);
  const [showRejectionReasonModal, setShowRejectionReasonModal] = useState(false); // New state for rejection reason modal
  const [rejectionReason, setRejectionReason] = useState(''); // New state for rejection reason text
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // State for Organizer Selection Modal
  const [showOrganizerModal, setShowOrganizerModal] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [allDepartments, setAllDepartments] = useState([]);
  const [allOffices, setAllOffices] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [organizerUsersMap, setOrganizerUsersMap] = useState({});
  
  // Refs for file inputs
  const newEventImageInputRef = useRef(null);
  const editEventImageInputRef = useRef(null);
  
  const currentUser = authService.getCurrentUser();
  const userRole = currentUser ? currentUser.role : null;
  
  // Fetch Users, Departments, Offices for the modal
  const fetchModalData = useCallback(async () => {
    setModalLoading(true);
    setModalError(null);
    try {
      const [usersResponse, deptsResponse, officesResponse] = await Promise.all([
        userService.getAllUsers(),
        departmentService.getAllDepartments(),
        officeService.getAllOffices()
      ]);

      // Extract data and ensure it's an array
      const usersData = Array.isArray(usersResponse?.data) ? usersResponse.data : [];
      const deptsData = Array.isArray(deptsResponse?.data) ? deptsResponse.data : [];
      const officesData = Array.isArray(officesResponse?.data) ? officesResponse.data : [];

      setAllUsers(usersData);
      setAllDepartments(deptsData);
      setAllOffices(officesData);
      
      // Create a map for easy lookup of user names by ID
      const userMap = usersData.reduce((acc, user) => {
        if(user && user.id) { // Ensure user and user.id exist
            acc[user.id] = user;
        }
        return acc;
      }, {});
      setOrganizerUsersMap(userMap);
      
    } catch (err) {
      console.error("Error fetching modal data:", err);
      // Provide more specific error feedback if possible
      const errorMsg = err.response?.data?.message || err.message || 'Không thể tải dữ liệu người dùng/phòng/ban.';
      setModalError(errorMsg);
      // Ensure states are arrays even on error
      setAllUsers([]); 
      setAllDepartments([]);
      setAllOffices([]);
    } finally {
      setModalLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchModalData();
  }, [fetchModalData]);
  
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (filter && filter !== 'all') {
        params.status = filter;
      }
      if (searchTerm) {
        params.search = searchTerm;
      }
      const response = await eventService.getAllEvents(params);
      setAllEvents(response || []);
      setFilteredEvents(response || []);
    } catch (err) {
      console.error("Error fetching events:", err);
      setError('Không thể tải danh sách sự kiện. Vui lòng thử lại.');
      setAllEvents([]);
      setFilteredEvents([]);
    } finally {
      setLoading(false);
    }
  }, [filter, searchTerm]);
  
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);
  
  // New useEffect for client-side filtering
  useEffect(() => {
    let results = [...allEvents];

    // Filter by status
    if (filter && filter !== 'all') {
      results = results.filter(event => event.status?.toUpperCase() === filter.toUpperCase());
    }

    // Filter by search term (case-insensitive title match)
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      results = results.filter(event => 
        event.title?.toLowerCase().includes(lowerSearchTerm)
      );
    }

    // Filter by Organizer (case-insensitive)
    if (organizerFilter) {
      const lowerOrganizerFilter = organizerFilter.toLowerCase();
      results = results.filter(event => 
        event.organizer?.toLowerCase().includes(lowerOrganizerFilter)
      );
    }

    // Filter by Location (case-insensitive)
    if (locationFilter) {
      const lowerLocationFilter = locationFilter.toLowerCase();
      results = results.filter(event => 
        event.location?.toLowerCase().includes(lowerLocationFilter)
      );
    }

    setFilteredEvents(results);
  }, [allEvents, filter, searchTerm, organizerFilter, locationFilter]);
  
  // Debounce effect for search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchTerm(searchInput); // Update actual search term after delay
    }, 500); // 500ms delay

    // Cleanup function to clear the timeout if input changes before delay
    return () => {
      clearTimeout(handler);
    };
  }, [searchInput]); // Run effect when searchInput changes

  const handleAddEvent = () => {
    setNewEvent({
      title: '',
      description: '',
      location: '',
      startDate: formatDateTimeForInput(new Date()),
      endDate: formatDateTimeForInput(new Date(Date.now() + 2 * 60 * 60 * 1000)),
      organizer: '',
      organizerIds: [],
      capacity: 100,
      image: '',
      targetAudience: '- Giảng viên quan tâm\n- Sinh viên các ngành CNTT',
      speaker: '',
      travelPlan: '',
      transportation: ''
    });
    setCurrentEvent(null); // Clear any previous edit state
    setShowEditModal(false); // Ensure edit modal is closed
    setShowAddModal(true);  // Open add modal
  };
  
  const handleEditEvent = (event) => {
    const organizerIds = event.organizers?.map(org => org.id) || [];
    
    setCurrentEvent({
      ...event,
      startDate: formatDateTimeForInput(new Date(event.startDate)),
      endDate: formatDateTimeForInput(new Date(event.endDate)),
      targetAudience: event.targetAudience || '- Giảng viên quan tâm\n- Sinh viên các ngành CNTT',
      organizerIds: organizerIds,
      speaker: event.speaker || '',
      travelPlan: event.travelPlan || '',
      transportation: event.transportation || ''
    });
    setNewEvent({ // Reset new event form state
      title: '', description: '', location: '', startDate: '', endDate: '',
      organizer: '', organizerIds: [], capacity: 100, image: '',
      targetAudience: '- Giảng viên quan tâm\n- Sinh viên các ngành CNTT',
      speaker: '', travelPlan: '', transportation: ''
    }); 
    setShowAddModal(false); // Ensure add modal is closed
    setShowEditModal(true); // Open edit modal
  };
  
  const handleDeleteEvent = (event) => {
    setEventToDelete(event);
    setShowDeleteConfirm(true);
  };
  
  const confirmDeleteEvent = async () => {
    if (eventToDelete) {
      setLoading(true);
      try {
        await eventService.deleteEvent(eventToDelete.id);
        setAllEvents(prevEvents => prevEvents.filter(event => event.id !== eventToDelete.id));
      } catch (err) {
        console.error("Error deleting event:", err);
        setError(`Lỗi xóa sự kiện: ${err.response?.data?.message || err.message}`);
      } finally {
        setShowDeleteConfirm(false);
        setEventToDelete(null);
        setLoading(false);
      }
    }
  };
  
  const handleApproveEvent = (event) => {
    setEventToApprove(event);
    setShowApproveConfirm(true);
  };
  
  const confirmApproveEvent = async () => {
    if (eventToApprove) {
      setLoading(true);
      try {
        const response = await eventService.approveEvent(eventToApprove.id);
        setAllEvents(prevEvents => prevEvents.map(event => 
          event.id === eventToApprove.id ? response.data : event
        ));
      } catch (err) {
        console.error("Error approving event:", err);
        setError(`Lỗi duyệt sự kiện: ${err.response?.data?.message || err.message}`);
      } finally {
        setShowApproveConfirm(false);
        setEventToApprove(null);
        setLoading(false);
      }
    }
  };
  
  const handleRejectEvent = (event) => {
    setEventToReject(event);
    setRejectionReason(''); // Reset reason
    setShowRejectionReasonModal(true); // Open reason modal instead of direct confirm
    // setShowRejectConfirm(true); // Old logic
  };
  
  const confirmRejectEvent = async () => { // Removed reason from params, will use state
    if (eventToReject && rejectionReason.trim()) { // Check if reason is provided
      setLoading(true);
      try {
        // Pass the reason to the service call
        const response = await eventService.rejectEvent(eventToReject.id, rejectionReason); 
        setAllEvents(prevEvents => prevEvents.map(event => 
          event.id === eventToReject.id ? response.data : event
        ));
        toast.success(`Sự kiện "${eventToReject.title}" đã được gửi yêu cầu chỉnh sửa.`);
      } catch (err) {
        console.error("Error rejecting event:", err);
        toast.error(`Lỗi từ chối sự kiện: ${err.response?.data?.message || err.message}`);
        setError(`Lỗi từ chối sự kiện: ${err.response?.data?.message || err.message}`);
      } finally {
        setShowRejectionReasonModal(false); // Close reason modal
        setShowRejectConfirm(false); // Ensure old confirm modal is closed
        setEventToReject(null);
        setRejectionReason('');
        setLoading(false);
      }
    } else if (!rejectionReason.trim()) {
        toast.error("Vui lòng nhập lý do từ chối.");
    }
  };
  
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    try {
      return new Date(dateString).toLocaleDateString('vi-VN', options);
    } catch (e) {
      console.error("Error formatting date:", dateString, e);
      return 'Ngày không hợp lệ';
    }
  };
  
  const formatDateTimeForInput = (date) => {
    if (!date) return '';
    try {
      const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
      return localDate.toISOString().slice(0, 16);
    } catch (e) {
        console.error("Error formatting date for input:", date, e);
        return '';
    }
  };
  
  const renderStatus = (status) => {
    switch(status?.toUpperCase()) {
      case 'APPROVED':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Đã duyệt</span>;
      case 'PENDING':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Chờ duyệt</span>;
      case 'NEEDS_REVISION': // Added new status display
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800">Cần sửa lại</span>;
      case 'CANCELLED':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Đã hủy</span>;
      case 'COMPLETED':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">Đã hoàn thành</span>;
      default:
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">{status || 'N/A'}</span>;
    }
  };
  
  const handleNewEventChange = (e) => {
    const { name, value } = e.target;
    setNewEvent(prev => ({
      ...prev,
      [name]: name === 'capacity' ? parseInt(value, 10) || 0 : value
    }));
  };
  
  const handleEditEventChange = (e) => {
    const { name, value } = e.target;
    setCurrentEvent(prev => ({
      ...prev,
      [name]: name === 'capacity' ? parseInt(value, 10) || 0 : value
    }));
  };
  
  const handleSaveNewEvent = async () => {
    // --- Comprehensive Validation for New Event ---
    if (!newEvent.title.trim()) {
      toast.error("Tiêu đề sự kiện không được để trống.");
      return;
    }
    if (!newEvent.description.trim()) {
      toast.error("Mô tả sự kiện không được để trống.");
      return;
    }
    if (!newEvent.location.trim()) {
      toast.error("Địa điểm sự kiện không được để trống.");
      return;
    }
    if (!newEvent.startDate) {
      toast.error("Thời gian bắt đầu không được để trống.");
      return;
    }
    const selectedStartDate = new Date(newEvent.startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to the beginning of today
    if (selectedStartDate < today) {
      toast.error("Thời gian bắt đầu sự kiện không được trước ngày hiện tại.");
      return;
    }
    if (!newEvent.endDate) {
      toast.error("Thời gian kết thúc không được để trống.");
      return;
    }
    if (new Date(newEvent.endDate) <= selectedStartDate) {
      toast.error("Thời gian kết thúc phải sau thời gian bắt đầu.");
      return;
    }
    if (!newEvent.organizer.trim()) {
      toast.error("Đơn vị tổ chức không được để trống.");
      return;
    }
    if (newEvent.capacity === null || newEvent.capacity === undefined || newEvent.capacity < 1) {
      toast.error("Số lượng tối đa phải là một số dương.");
      return;
    }
    if (!newEvent.targetAudience.trim()) {
      toast.error("Đối tượng tham gia không được để trống.");
      return;
    }
    // --- End Validation ---

    setLoading(true);
    const { organizingCommittee, ...restOfNewEvent } = newEvent;
    const eventDataToSend = {
        ...restOfNewEvent,
        userId: currentUser?.id,
        startDate: new Date(newEvent.startDate).toISOString(),
        endDate: new Date(newEvent.endDate).toISOString(),
        organizerIds: newEvent.organizerIds
    };

    console.log("Sending new event data:", eventDataToSend);

    try {
      const createdEvent = await eventService.createEvent(eventDataToSend);
      setAllEvents(prevEvents => [...prevEvents, createdEvent]);
      setShowAddModal(false);
    } catch (err) {
      console.error("Error creating event:", err);
      setError(`Lỗi tạo sự kiện: ${err.response?.data?.message || err.message}`);
    } finally {
        setLoading(false);
    }
  };
  
  const handleSaveEditedEvent = async () => {
    if (currentEvent) {
      // --- Comprehensive Validation for Edited Event ---
      if (!currentEvent.title.trim()) {
        toast.error("Tiêu đề sự kiện không được để trống.");
        return;
      }
      if (!currentEvent.description.trim()) {
        toast.error("Mô tả sự kiện không được để trống.");
        return;
      }
      if (!currentEvent.location.trim()) {
        toast.error("Địa điểm sự kiện không được để trống.");
        return;
      }
      if (!currentEvent.startDate) {
        toast.error("Thời gian bắt đầu không được để trống.");
        return;
      }
      // Note: For edits, we might allow past start dates if the event already started and is being updated.
      // If you want to prevent startDate from being in the past even for edits (unless event.status is like 'COMPLETED'), add that check here.
      const selectedStartDateForEdit = new Date(currentEvent.startDate);
      if (!currentEvent.endDate) {
        toast.error("Thời gian kết thúc không được để trống.");
        return;
      }
      if (new Date(currentEvent.endDate) <= selectedStartDateForEdit) {
        toast.error("Thời gian kết thúc phải sau thời gian bắt đầu.");
        return;
      }
      if (!currentEvent.organizer.trim()) {
        toast.error("Đơn vị tổ chức không được để trống.");
        return;
      }
      if (currentEvent.capacity === null || currentEvent.capacity === undefined || currentEvent.capacity < 1) {
        toast.error("Số lượng tối đa phải là một số dương.");
        return;
      }
      if (!currentEvent.targetAudience.trim()) {
        toast.error("Đối tượng tham gia không được để trống.");
        return;
      }
      // --- End Validation ---

      setLoading(true);
      const { organizingCommittee, organizers, ...restOfCurrentEvent } = currentEvent;
      const eventDataToSend = {
        ...restOfCurrentEvent,
        userId: currentUser?.id,
        startDate: new Date(currentEvent.startDate).toISOString(),
        endDate: new Date(currentEvent.endDate).toISOString(),
        organizerIds: currentEvent.organizerIds
      };
       console.log("Sending updated event data:", eventDataToSend);

      try {
        const updatedEvent = await eventService.updateEvent(currentEvent.id, eventDataToSend);
        setAllEvents(prevEvents => prevEvents.map(event => 
          event.id === currentEvent.id ? updatedEvent : event 
        ));
        setShowEditModal(false);
        setCurrentEvent(null);
      } catch (err) {
        console.error("Error updating event:", err);
        setError(`Lỗi cập nhật sự kiện: ${err.response?.data?.message || err.message}`);
      } finally {
          setLoading(false);
      }
    }
  };
  
  const openOrganizerModal = (isEditing = false) => {
    const initialIds = isEditing ? currentEvent?.organizerIds || [] : newEvent?.organizerIds || [];
    setShowOrganizerModal(true);
  };

  const handleConfirmOrganizers = (selectedIds) => {
    // === Bắt đầu Debug ===
    console.log("handleConfirmOrganizers called with:", selectedIds);
    console.log("Current state:", { showAddModal, showEditModal, currentEvent }); 
    // === Kết thúc Debug ===

    if (showEditModal && currentEvent) {
      console.log("Updating currentEvent (Edit Modal)"); // Debug
      setCurrentEvent(prev => ({ ...prev, organizerIds: selectedIds }));
    } else if (showAddModal) {
      console.log("Updating newEvent (Add Modal)"); // Debug
      setNewEvent(prev => ({ ...prev, organizerIds: selectedIds }));
    } else {
      console.warn("handleConfirmOrganizers called but neither Add nor Edit modal seems active?"); // Debug
    }
  };

  const getOrganizerNames = (ids = []) => {
    return ids
      .map(id => organizerUsersMap[id]?.username || `User #${id}`)
      .join(', ');
  };
  
  const canAddEvent = userRole === 'ADMIN' || userRole === 'MANAGER' || userRole === 'ORGANIZER' || userRole === 'STAFF';
  
  const canEditEvent = (event) => {
    if (!currentUser || !event) return false;
    if (userRole === 'ADMIN' || userRole === 'MANAGER') return true;
    // Allow ORGANIZER or STAFF to edit if they created the event
    if ((userRole === 'ORGANIZER' || userRole === 'STAFF') ) return true; 
    return false;
  };
  
  const canDeleteEvent = (event) => {
     if (!currentUser || !event) return false;
    if (userRole === 'ADMIN') return true;
    if (userRole === 'MANAGER' && event.status?.toUpperCase() !== 'COMPLETED') return true;
    if (userRole === 'ORGANIZER' && event.createdBy === currentUser.email && event.status?.toUpperCase() === 'PENDING') return true;
    return false;
  };
  
  const canApproveRejectEvent = (event) => {
     if (!currentUser || !event) return false;
     // Only ADMIN can approve/reject, and only if the event is PENDING
     return userRole === 'ADMIN' && event.status?.toUpperCase() === 'PENDING'; 
  };
  
  const handleImageUpload = async (file, eventType = 'new') => {
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
        
        if (eventType === 'new') {
          setNewEvent(prev => ({ ...prev, image: imageUrl }));
        } else if (eventType === 'edit') {
          setCurrentEvent(prev => ({ ...prev, image: imageUrl }));
        }
        
        return imageUrl;
      } else {
        throw new Error('Tải ảnh lên không thành công');
      }
    } catch (err) {
      console.error('Lỗi khi tải ảnh lên:', err);
      setError(`Lỗi tải ảnh lên: ${err.message}`);
      return null;
    } finally {
      setUploadingImage(false);
      setUploadProgress(0);
      if (eventType === 'new' && newEventImageInputRef.current) {
        newEventImageInputRef.current.value = '';
      } else if (eventType === 'edit' && editEventImageInputRef.current) {
        editEventImageInputRef.current.value = '';
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

  return (
    <div className="container mx-auto px-4 py-6">
      <UserSelectionModal 
        isOpen={showOrganizerModal}
        onClose={() => setShowOrganizerModal(false)}
        allUsers={allUsers}
        allDepartments={allDepartments}
        allOffices={allOffices}
        initialSelectedIds={showEditModal ? currentEvent?.organizerIds || [] : newEvent?.organizerIds || []}
        onConfirm={handleConfirmOrganizers}
        isLoading={modalLoading}
      />
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý Sự kiện</h1>
        <div className="flex space-x-2">
          {canAddEvent && (
            <button
              onClick={handleAddEvent}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md shadow-sm disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Đang xử lý...' : 'Thêm sự kiện mới'}
            </button>
          )}
        </div>
      </div>
      
      <Toaster position="bottom-right" toastOptions={{ duration: 3000 }} />
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
      
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between space-y-3 md:space-y-0">
          <div className="flex flex-col md:flex-row md:items-end space-y-3 md:space-y-0 md:space-x-4 flex-wrap">
            <div>
              <label htmlFor="filter" className="block text-sm font-medium text-gray-700 mb-1">Lọc theo trạng thái</label>
              <select
                id="filter"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                disabled={loading}
              >
                <option value="all">Tất cả</option>
                <option value="PENDING">Chờ duyệt</option>
                <option value="APPROVED">Đã duyệt</option>
                <option value="NEEDS_REVISION">Cần sửa lại</option> {/* Added to filter options */}
                <option value="CANCELLED">Đã hủy</option>
                <option value="COMPLETED">Đã hoàn thành</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Tìm theo tên</label>
              <input
                type="text"
                id="search"
                placeholder="Tìm theo tên sự kiện..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="organizerFilter" className="block text-sm font-medium text-gray-700 mb-1">Lọc theo đơn vị tổ chức</label>
              <input
                type="text"
                id="organizerFilter"
                placeholder="Nhập đơn vị..."
                value={organizerFilter}
                onChange={(e) => setOrganizerFilter(e.target.value)}
                className="block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="locationFilter" className="block text-sm font-medium text-gray-700 mb-1">Lọc theo địa điểm</label>
              <input
                type="text"
                id="locationFilter"
                placeholder="Nhập địa điểm..."
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                disabled={loading}
              />
            </div>

          </div>
          
          <div className="text-sm text-gray-500">
            Hiển thị {filteredEvents?.length} sự kiện
          </div>
        </div>
      </div>
      
      {loading && filteredEvents?.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          <span className="ml-3 text-lg text-gray-700">Đang tải...</span>
        </div>
      ) : !loading && filteredEvents?.length === 0 && !error ? (
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">Không tìm thấy sự kiện</h3>
          <p className="mt-1 text-sm text-gray-500">
            Không có sự kiện nào phù hợp với điều kiện lọc/tìm kiếm của bạn.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents?.map((event) => (
            <div key={event.id} className="bg-white shadow rounded-lg overflow-hidden transition-opacity duration-300 ease-in-out">
              <div className="h-48 overflow-hidden">
                <img 
                  src={event?.image || 'https://via.placeholder.com/400x200?text=No+Image'} 
                  alt={event?.title}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.onerror = null; e.target.src='https://via.placeholder.com/400x200?text=Image+Error'; }}
                />
              </div>
              
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">{event.title}</h2>
                  {renderStatus(event.status)}
                </div>
                
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{event.description}</p>
                
                <div className="text-sm text-gray-500 mb-1 flex items-center">
                  <svg className="flex-shrink-0 h-4 w-4 mr-1.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{event.location}</span>
                </div>
                
                <div className="text-sm text-gray-500 mb-1 flex items-center">
                  <svg className="flex-shrink-0 h-4 w-4 mr-1.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{formatDateTime(event.startDate)}</span>
                </div>
                
                <div className="text-sm text-gray-500 mb-3 flex items-center">
                  <svg className="flex-shrink-0 h-4 w-4 mr-1.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>{event.registrations ?? 0} / {event.capacity} đăng ký</span>
                </div>
                
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-gray-500">
                      Tổ chức bởi: {event.organizer}
                    </div>
                    
                    <div className="flex space-x-2">
                      {canApproveRejectEvent(event) && (
                        <>
                          <button
                            onClick={() => handleApproveEvent(event)}
                            className="text-xs bg-green-100 hover:bg-green-200 text-green-800 font-medium py-1 px-2 rounded disabled:opacity-50"
                            disabled={loading}
                          >
                            Duyệt
                          </button>
                          <button
                            onClick={() => handleRejectEvent(event)}
                            className="text-xs bg-red-100 hover:bg-red-200 text-red-800 font-medium py-1 px-2 rounded disabled:opacity-50"
                            disabled={loading}
                          >
                            Từ chối
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 mt-3">
                  <a 
                    href={`http://localhost:5174/events/${event.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-1 px-2 rounded inline-block"
                  >
                    Xem chi tiết
                  </a>
                  <button
                    onClick={() => navigate(`/events/${event.id}/registrations`)}
                    className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 font-medium py-1 px-2 rounded"
                  >
                    Xem danh sách đăng ký
                  </button>
                  {canEditEvent(event) && (
                    <button
                      onClick={() => handleEditEvent(event)}
                      className="text-xs bg-indigo-100 hover:bg-indigo-200 text-indigo-800 font-medium py-1 px-2 rounded disabled:opacity-50"
                      disabled={loading}
                    >
                      Chỉnh sửa
                    </button>
                  )}
                  
                  {canDeleteEvent(event) && (
                    <button
                      onClick={() => handleDeleteEvent(event)}
                      className="text-xs bg-red-100 hover:bg-red-200 text-red-800 font-medium py-1 px-2 rounded disabled:opacity-50"
                      disabled={loading}
                    >
                      Xóa
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 overflow-y-auto p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full p-6 m-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Thêm sự kiện mới</h2>
              <button
                onClick={() => !loading && setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-500 disabled:opacity-50"
                disabled={loading}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-4">
              <div className="col-span-2">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Tiêu đề sự kiện <span className="text-red-500">*</span>
                </label>
                <input
                  type="text" id="title" name="title" value={newEvent.title}
                  onChange={handleNewEventChange}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required disabled={loading}
                />
              </div>
              
              <div className="col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description" name="description" rows="4" value={newEvent.description}
                  onChange={handleNewEventChange}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required disabled={loading}
                ></textarea>
              </div>
              
              <div className="col-span-2">
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  Địa điểm <span className="text-red-500">*</span>
                </label>
                <input
                  type="text" id="location" name="location" value={newEvent.location}
                  onChange={handleNewEventChange}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required disabled={loading}
                />
              </div>
              
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Thời gian bắt đầu <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local" id="startDate" name="startDate" value={newEvent.startDate}
                  onChange={handleNewEventChange}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required disabled={loading}
                />
              </div>
              
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Thời gian kết thúc <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local" id="endDate" name="endDate" value={newEvent.endDate}
                  onChange={handleNewEventChange}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required disabled={loading}
                />
              </div>
              
              <div>
                <label htmlFor="organizer" className="block text-sm font-medium text-gray-700 mb-1">
                  Đơn vị tổ chức <span className="text-red-500">*</span>
                </label>
                <input
                  type="text" id="organizer" name="organizer" value={newEvent.organizer}
                  onChange={handleNewEventChange}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required disabled={loading}
                />
              </div>
              
              <div>
                <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-1">
                  Số lượng tối đa <span className="text-red-500">*</span>
                </label>
                <input
                  type="number" id="capacity" name="capacity" min="1" value={newEvent.capacity}
                  onChange={handleNewEventChange}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required disabled={loading}
                />
              </div>
              
              <div className="col-span-2">
                <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
                  Hình ảnh sự kiện
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <input
                      type="file"
                      id="image-upload"
                      accept="image/*"
                      onChange={handleNewImageSelect}
                      ref={newEventImageInputRef}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                      disabled={loading || uploadingImage}
                    />
                    <p className="mt-1 text-xs text-gray-500">Tải lên hình ảnh cho sự kiện (tối đa 5MB)</p>
                    
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
                      id="image"
                      name="image"
                      value={newEvent.image}
                      onChange={handleNewEventChange}
                      placeholder="https://example.com/image.jpg"
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      disabled={loading}
                    />
                    <p className="mt-1 text-xs text-gray-500">Hoặc nhập URL hình ảnh có sẵn</p>
                    
                    {newEvent.image && (
                      <div className="mt-2">
                        <img 
                          src={newEvent.image} 
                          alt="Preview" 
                          className="h-28 w-auto object-cover rounded-md"
                          onError={(e) => { e.target.onerror = null; e.target.src='https://via.placeholder.com/100x100?text=Image+Error'; }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="col-span-2">
                <label htmlFor="targetAudience" className="block text-sm font-medium text-gray-700 mb-1">
                  Đối tượng tham gia <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="targetAudience" name="targetAudience" rows="3" value={newEvent.targetAudience}
                  onChange={handleNewEventChange}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required disabled={loading}
                  placeholder="- Giảng viên quan tâm&#10;- Sinh viên các ngành CNTT"
                ></textarea>
                <p className="mt-1 text-xs text-gray-500">Mỗi đối tượng nhập trên một dòng, bắt đầu bằng dấu gạch ngang (-)</p>
              </div>
              
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ban tổ chức (Người dùng)
                </label>
                <div className="border border-gray-300 rounded-md p-3 min-h-[60px]">
                   {newEvent.organizerIds.length === 0 ? (
                     <p className="text-sm text-gray-500 italic">Chưa chọn thành viên nào.</p>
                   ) : (
                     <div className="flex flex-wrap gap-2">
                       {newEvent.organizerIds.map(id => (
                         <span key={id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                           {organizerUsersMap[id]?.username || `User #${id}`}
                         </span>
                       ))}
                     </div>
                   )}
                </div>
                <button 
                  type="button"
                  onClick={() => openOrganizerModal(false)}
                  className="mt-2 text-sm text-indigo-600 hover:text-indigo-500 disabled:opacity-50"
                   disabled={loading || modalLoading} >
                  {modalLoading ? 'Đang tải dữ liệu...' : 'Chọn/Thay đổi Ban tổ chức'}
                </button>
              </div>
              
              <div className="col-span-2">
                <label htmlFor="speaker" className="block text-sm font-medium text-gray-700 mb-1">
                  Diễn giả
                </label>
                <textarea
                  id="speaker" name="speaker" rows="3" value={newEvent.speaker}
                  onChange={handleNewEventChange}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  disabled={loading}
                ></textarea>
                 <p className="mt-1 text-xs text-gray-500">Mỗi diễn giả/thông tin nhập trên một dòng</p>
              </div>
              
              <div className="col-span-2">
                <label htmlFor="travelPlan" className="block text-sm font-medium text-gray-700 mb-1">
                  Kế hoạch di chuyển
                </label>
                <textarea
                  id="travelPlan" name="travelPlan" rows="3" value={newEvent.travelPlan}
                  onChange={handleNewEventChange}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  disabled={loading}
                ></textarea>
                 <p className="mt-1 text-xs text-gray-500">Mỗi mục nhập trên một dòng</p>
              </div>
              
              <div className="col-span-2">
                <label htmlFor="transportation" className="block text-sm font-medium text-gray-700 mb-1">
                  Phương tiện
                </label>
                <textarea
                  id="transportation" name="transportation" rows="3" value={newEvent.transportation}
                  onChange={handleNewEventChange}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  disabled={loading}
                ></textarea>
                 <p className="mt-1 text-xs text-gray-500">Mỗi phương tiện/thông tin nhập trên một dòng</p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowAddModal(false)}
                className="bg-white border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md hover:bg-gray-50 disabled:opacity-50"
                disabled={loading}
              >
                Hủy
              </button>
              <button
                onClick={handleSaveNewEvent}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md shadow-sm disabled:opacity-50"
                disabled={loading || uploadingImage}
              >
                {loading ? 'Đang tạo...' : 'Tạo sự kiện'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {showDeleteConfirm && eventToDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-start mb-4">
              <div className="flex-shrink-0 bg-red-100 rounded-full p-2 mr-3">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-grow">
                <h3 className="text-lg font-medium text-gray-900">Xác nhận xóa sự kiện</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Bạn có chắc chắn muốn xóa sự kiện "{eventToDelete.title}"? Hành động này không thể hoàn tác.
                </p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-5">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="bg-white border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md hover:bg-gray-50 disabled:opacity-50"
                disabled={loading}
              >
                Hủy
              </button>
              <button
                onClick={confirmDeleteEvent}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md shadow-sm disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Đang xóa...' : 'Xóa sự kiện'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {showApproveConfirm && eventToApprove && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-start mb-4">
              <div className="flex-shrink-0 bg-green-100 rounded-full p-2 mr-3">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex-grow">
                <h3 className="text-lg font-medium text-gray-900">Xác nhận phê duyệt sự kiện</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Bạn có chắc chắn muốn phê duyệt sự kiện "{eventToApprove.title}"?
                </p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-5">
              <button
                onClick={() => setShowApproveConfirm(false)}
                className="bg-white border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md hover:bg-gray-50 disabled:opacity-50"
                disabled={loading}
              >
                Hủy
              </button>
              <button
                onClick={confirmApproveEvent}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md shadow-sm disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Đang duyệt...' : 'Phê duyệt'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {showRejectConfirm && eventToReject && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-start mb-4">
              <div className="flex-shrink-0 bg-red-100 rounded-full p-2 mr-3">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div className="flex-grow">
                <h3 className="text-lg font-medium text-gray-900">Xác nhận từ chối sự kiện</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Bạn có chắc chắn muốn từ chối sự kiện "{eventToReject.title}"? Sự kiện sẽ được đánh dấu là đã hủy.
                </p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-5">
              <button
                onClick={() => setShowRejectConfirm(false)}
                className="bg-white border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md hover:bg-gray-50 disabled:opacity-50"
                disabled={loading}
              >
                Hủy
              </button>
              <button
                onClick={confirmRejectEvent}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md shadow-sm disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Đang từ chối...' : 'Từ chối'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Edit Event Modal --- */}
      {showEditModal && currentEvent && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 overflow-y-auto p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full p-6 m-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Chỉnh sửa sự kiện</h2>
              <button
                onClick={() => !loading && setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-500 disabled:opacity-50"
                disabled={loading}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-4">
              {/* Display Rejection Reason if applicable */}
              {currentEvent.status === 'NEEDS_REVISION' && currentEvent.rejectionReason && (
                <div className="col-span-2 p-3 mb-3 bg-yellow-50 border border-yellow-300 rounded-md">
                  <h4 className="text-sm font-semibold text-yellow-800 mb-1">Lý do cần chỉnh sửa:</h4>
                  <p className="text-sm text-yellow-700 whitespace-pre-wrap">{currentEvent.rejectionReason}</p>
                </div>
              )}

              {/* Title */}
              <div className="col-span-2">
                <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700 mb-1">
                  Tiêu đề sự kiện <span className="text-red-500">*</span>
                </label>
                <input
                  type="text" id="edit-title" name="title" value={currentEvent.title}
                  onChange={handleEditEventChange}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required disabled={loading}
                />
              </div>

              {/* Description */}
              <div className="col-span-2">
                <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="edit-description" name="description" rows="4" value={currentEvent.description}
                  onChange={handleEditEventChange}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required disabled={loading}
                ></textarea>
              </div>

              {/* Location */}
              <div className="col-span-2">
                <label htmlFor="edit-location" className="block text-sm font-medium text-gray-700 mb-1">
                  Địa điểm <span className="text-red-500">*</span>
                </label>
                <input
                  type="text" id="edit-location" name="location" value={currentEvent.location}
                  onChange={handleEditEventChange}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required disabled={loading}
                />
              </div>

              {/* Start Date */}
              <div>
                <label htmlFor="edit-startDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Thời gian bắt đầu <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local" id="edit-startDate" name="startDate" value={currentEvent.startDate}
                  onChange={handleEditEventChange}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required disabled={loading}
                />
              </div>

              {/* End Date */}
              <div>
                <label htmlFor="edit-endDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Thời gian kết thúc <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local" id="edit-endDate" name="endDate" value={currentEvent.endDate}
                  onChange={handleEditEventChange}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required disabled={loading}
                />
              </div>

              {/* Organizer */}
              <div>
                <label htmlFor="edit-organizer" className="block text-sm font-medium text-gray-700 mb-1">
                  Đơn vị tổ chức <span className="text-red-500">*</span>
                </label>
                <input
                  type="text" id="edit-organizer" name="organizer" value={currentEvent.organizer}
                  onChange={handleEditEventChange}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required disabled={loading}
                />
              </div>

              {/* Capacity */}
              <div>
                <label htmlFor="edit-capacity" className="block text-sm font-medium text-gray-700 mb-1">
                  Số lượng tối đa <span className="text-red-500">*</span>
                </label>
                <input
                  type="number" id="edit-capacity" name="capacity" min="1" value={currentEvent.capacity}
                  onChange={handleEditEventChange}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required disabled={loading}
                />
              </div>

              {/* Image */}
              <div className="col-span-2">
                <label htmlFor="edit-image-upload" className="block text-sm font-medium text-gray-700 mb-1">
                  Hình ảnh sự kiện
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <input
                      type="file"
                      id="edit-image-upload"
                      accept="image/*"
                      onChange={handleEditImageSelect}
                      ref={editEventImageInputRef}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                      disabled={loading || uploadingImage}
                    />
                    <p className="mt-1 text-xs text-gray-500">Tải lên hình ảnh mới (tối đa 5MB)</p>

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
                      id="edit-image-url"
                      name="image"
                      value={currentEvent.image || ''}
                      onChange={handleEditEventChange}
                      placeholder="https://example.com/image.jpg"
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      disabled={loading}
                    />
                    <p className="mt-1 text-xs text-gray-500">Hoặc nhập URL hình ảnh có sẵn</p>

                    {currentEvent.image && (
                      <div className="mt-2">
                        <img
                          src={currentEvent.image}
                          alt="Current Event Preview"
                          className="h-28 w-auto object-cover rounded-md"
                          onError={(e) => { e.target.onerror = null; e.target.src='https://via.placeholder.com/100x100?text=Image+Error'; }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Target Audience */}
              <div className="col-span-2">
                <label htmlFor="edit-targetAudience" className="block text-sm font-medium text-gray-700 mb-1">
                  Đối tượng tham gia <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="edit-targetAudience" name="targetAudience" rows="3" value={currentEvent.targetAudience}
                  onChange={handleEditEventChange}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required disabled={loading}
                  placeholder="- Giảng viên quan tâm&#10;- Sinh viên các ngành CNTT"
                ></textarea>
                <p className="mt-1 text-xs text-gray-500">Mỗi đối tượng nhập trên một dòng, bắt đầu bằng dấu gạch ngang (-)</p>
              </div>

              {/* Organizer Users */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ban tổ chức (Người dùng)
                </label>
                <div className="border border-gray-300 rounded-md p-3 min-h-[60px]">
                   {(currentEvent.organizerIds || []).length === 0 ? (
                     <p className="text-sm text-gray-500 italic">Chưa chọn thành viên nào.</p>
                   ) : (
                     <div className="flex flex-wrap gap-2">
                       {currentEvent.organizerIds.map(id => (
                         <span key={id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                           {organizerUsersMap[id]?.username || `User #${id}`}
                         </span>
                       ))}
                     </div>
                   )}
                </div>
                <button
                  type="button"
                  onClick={() => openOrganizerModal(true)}
                  className="mt-2 text-sm text-indigo-600 hover:text-indigo-500 disabled:opacity-50"
                   disabled={loading || modalLoading} >
                  {modalLoading ? 'Đang tải dữ liệu...' : 'Chọn/Thay đổi Ban tổ chức'}
                </button>
              </div>

              {/* Speaker */}
              <div className="col-span-2">
                <label htmlFor="edit-speaker" className="block text-sm font-medium text-gray-700 mb-1">
                  Diễn giả
                </label>
                <textarea
                  id="edit-speaker" name="speaker" rows="3" value={currentEvent.speaker || ''}
                  onChange={handleEditEventChange}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  disabled={loading}
                  placeholder="- GS.TS Khoa Học ABC\n- Chuyên gia XYZ"
                ></textarea>
                 <p className="mt-1 text-xs text-gray-500">Mỗi diễn giả/thông tin nhập trên một dòng</p>
              </div>

              {/* Travel Plan */}
              <div className="col-span-2">
                <label htmlFor="edit-travelPlan" className="block text-sm font-medium text-gray-700 mb-1">
                  Kế hoạch di chuyển
                </label>
                <textarea
                  id="edit-travelPlan" name="travelPlan" rows="3" value={currentEvent.travelPlan || ''}
                  onChange={handleEditEventChange}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  disabled={loading}
                ></textarea>
                 <p className="mt-1 text-xs text-gray-500">Mỗi mục nhập trên một dòng</p>
              </div>

              {/* Transportation */}
              <div className="col-span-2">
                <label htmlFor="edit-transportation" className="block text-sm font-medium text-gray-700 mb-1">
                  Phương tiện
                </label>
                <textarea
                  id="edit-transportation" name="transportation" rows="3" value={currentEvent.transportation || ''}
                  onChange={handleEditEventChange}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  disabled={loading}
                ></textarea>
                 <p className="mt-1 text-xs text-gray-500">Mỗi phương tiện/thông tin nhập trên một dòng</p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowEditModal(false)}
                className="bg-white border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md hover:bg-gray-50 disabled:opacity-50"
                disabled={loading}
              >
                Hủy
              </button>
              <button
                onClick={handleSaveEditedEvent}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md shadow-sm disabled:opacity-50"
                disabled={loading || uploadingImage || !currentEvent.title}
              >
                {loading ? 'Đang cập nhật...' : 'Cập nhật sự kiện'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* --- End Edit Event Modal --- */}

      <RejectionReasonModal
        isOpen={showRejectionReasonModal}
        onClose={() => {
          setShowRejectionReasonModal(false);
          setEventToReject(null);
          setRejectionReason('');
        }}
        onSubmit={confirmRejectEvent}
        reason={rejectionReason}
        setReason={setRejectionReason}
        loading={loading}
      />
    </div>
  );
};

export default Events; 