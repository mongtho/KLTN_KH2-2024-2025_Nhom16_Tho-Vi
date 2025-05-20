import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import eventService from '../services/eventService';
import { authService } from '../services'; // Import authService
import { FiArrowLeft, FiEdit, FiUsers, FiCalendar, FiMapPin, FiUser, FiCheckCircle, FiXCircle, FiTrash2 } from 'react-icons/fi';
import { format } from 'date-fns';
import vi from 'date-fns/locale/vi';

const EventDetails = () => {
  const { id: eventId } = useParams(); // Rename id to eventId for clarity
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const currentUser = authService.getCurrentUser();
  const userRole = currentUser?.role;

  // Helper function to format date/time
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'HH:mm, dd MMMM, yyyy', { locale: vi });
    } catch (e) {
      console.error("Error formatting date:", dateString, e);
      return 'Ngày không hợp lệ';
    }
  };

  // Helper to render status
  const renderStatus = (status) => {
    switch(status?.toUpperCase()) {
      case 'APPROVED': return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Đã duyệt</span>;
      case 'PENDING': return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Chờ duyệt</span>;
      case 'CANCELLED': return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Đã hủy</span>;
      case 'COMPLETED': return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">Đã hoàn thành</span>;
      default: return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">{status || 'N/A'}</span>;
    }
  };

  useEffect(() => {
    const fetchEventDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await eventService.getEventById(eventId);
        setEvent(data);
      } catch (err) {
        console.error("Error fetching event details:", err);
        setError(`Lỗi tải chi tiết sự kiện: ${err.response?.data?.message || err.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchEventDetails();
    } else {
      setError("ID sự kiện không hợp lệ.");
      setLoading(false);
    }
  }, [eventId]);

  // Permissions (similar logic from Events.jsx, adapt if needed)
  const canEditEvent = (evt) => {
    if (!currentUser || !evt) return false;
    if (userRole === 'ADMIN' || userRole === 'MANAGER') return true;
    if (userRole === 'ORGANIZER' && evt.createdBy === currentUser.email) return true; 
    return false;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        <span className="ml-3 text-lg text-gray-700">Đang tải chi tiết sự kiện...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Link to="/events" className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 mb-4">
          <FiArrowLeft className="mr-1 h-4 w-4" />
          Quay lại Danh sách Sự kiện
        </Link>
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
          <p className="font-bold">Đã xảy ra lỗi</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Link to="/events" className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 mb-4">
          <FiArrowLeft className="mr-1 h-4 w-4" />
          Quay lại Danh sách Sự kiện
        </Link>
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md" role="alert">
          <p className="font-bold">Không tìm thấy sự kiện</p>
          <p>Không thể tìm thấy sự kiện với ID được cung cấp.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Back Link and Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <Link 
          to="/events" 
          className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800"
        >
          <FiArrowLeft className="mr-1 h-4 w-4" />
          Quay lại Danh sách Sự kiện
        </Link>
        <div className="flex space-x-3">
           <button
              onClick={() => navigate(`/events/${event.id}/registrations`)}
              className="inline-flex items-center bg-blue-100 hover:bg-blue-200 text-blue-800 font-medium py-2 px-4 rounded-md shadow-sm text-sm"
            >
              <FiUsers className="mr-2 h-4 w-4" />
              Xem Đăng ký ({event.registrations ?? 0})
           </button>
          {canEditEvent(event) && (
            <button 
              // Ideally, this would open the edit modal from Events.jsx or navigate to an edit page
              // For now, let's just show the button, functionality can be added later
              // onClick={() => navigate(`/events/${event.id}/edit`)} // Example: Navigate to edit page
              onClick={() => alert('Chức năng chỉnh sửa từ trang chi tiết chưa được triển khai.')} // Placeholder
              className="inline-flex items-center bg-indigo-100 hover:bg-indigo-200 text-indigo-800 font-medium py-2 px-4 rounded-md shadow-sm text-sm"
            >
              <FiEdit className="mr-2 h-4 w-4" />
              Chỉnh sửa
            </button>
          )}
        </div>
      </div>

      {/* Main Event Details Card */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Event Image Header */}
        {event.image && (
          <div className="h-64 w-full overflow-hidden">
            <img 
              src={event.image}
              alt={`Hình ảnh cho ${event.title}`}
              className="w-full h-full object-cover"
              onError={(e) => { e.target.style.display = 'none'; }} // Hide image on error
            />
          </div>
        )}

        {/* Event Content */}
        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start mb-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-0">{event.title}</h1>
            {renderStatus(event.status)}
          </div>

          <p className="text-gray-700 mb-6 whitespace-pre-wrap">{event.description}</p>

          {/* Key Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 border-t border-gray-200 pt-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div className="flex items-start">
                <FiCalendar className="flex-shrink-0 h-5 w-5 mr-3 text-indigo-500 mt-1" />
                <div>
                  <span className="text-sm font-medium text-gray-500 block">Thời gian</span>
                  <span className="text-gray-900">
                    {formatDateTime(event.startDate)} - {formatDateTime(event.endDate)}
                  </span>
                </div>
              </div>
              <div className="flex items-start">
                <FiMapPin className="flex-shrink-0 h-5 w-5 mr-3 text-indigo-500 mt-1" />
                <div>
                  <span className="text-sm font-medium text-gray-500 block">Địa điểm</span>
                  <span className="text-gray-900">{event.location}</span>
                </div>
              </div>
               <div className="flex items-start">
                <FiUser className="flex-shrink-0 h-5 w-5 mr-3 text-indigo-500 mt-1" />
                <div>
                  <span className="text-sm font-medium text-gray-500 block">Đơn vị tổ chức</span>
                  <span className="text-gray-900">{event.organizer}</span>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div className="flex items-start">
                <FiUsers className="flex-shrink-0 h-5 w-5 mr-3 text-indigo-500 mt-1" />
                <div>
                  <span className="text-sm font-medium text-gray-500 block">Số lượng</span>
                  <span className="text-gray-900">{event.registrations ?? 0} / {event.capacity} đăng ký</span>
                </div>
              </div>
              {/* Add more details like Target Audience, Speaker if available */}
              {event.targetAudience && (
                <div className="flex items-start">
                  <svg className="flex-shrink-0 h-5 w-5 mr-3 text-indigo-500 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                  <div>
                    <span className="text-sm font-medium text-gray-500 block">Đối tượng</span>
                    <div className="text-gray-900 whitespace-pre-wrap">{event.targetAudience}</div>
                  </div>
                </div>
              )}
               {event.speaker && (
                <div className="flex items-start">
                   <svg className="flex-shrink-0 h-5 w-5 mr-3 text-indigo-500 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2V7a2 2 0 012-2h6l2-2h4V4a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h6l4 4v-4z" /></svg>
                  <div>
                    <span className="text-sm font-medium text-gray-500 block">Diễn giả</span>
                    <div className="text-gray-900 whitespace-pre-wrap">{event.speaker}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

           {/* Additional Details Section (Organizers, Travel, Transport) */}
          {(event.organizers?.length > 0 || event.travelPlan || event.transportation) && (
            <div className="border-t border-gray-200 pt-6 mt-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Thông tin bổ sung</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {/* Organizers List */}
                {event.organizers && event.organizers.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Ban tổ chức</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                      {event.organizers.map(org => <li key={org.id}>{org.username} ({org.email})</li>)}
                    </ul>
                  </div>
                )}
                {/* Travel Plan */}
                {event.travelPlan && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Kế hoạch di chuyển</h3>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{event.travelPlan}</p>
                  </div>
                )}
                 {/* Transportation */}
                {event.transportation && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Phương tiện</h3>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{event.transportation}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetails; 