import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaCalendar, FaMapMarkerAlt, FaClock, FaUsers, FaUserTie, FaPhone, FaEnvelope, FaCheckCircle, FaBuilding, FaLaptop, FaClipboardCheck, FaTimesCircle, FaMicrophone, FaRoute, FaBus, FaInfoCircle, FaBullseye, FaUsersCog } from 'react-icons/fa';
import moment from 'moment';
import eventService from '../services/eventService'; // Import eventService
import authService from '../services/auth.service'; // Import authService for user check
import { toast } from 'react-toastify';

const EventDetail = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false); // State to track registration status
  const [isRegistering, setIsRegistering] = useState(false); // State for registration loading
  const [isCancelling, setIsCancelling] = useState(false); // State for cancellation loading
  const [currentUser] = useState(authService.getCurrentUser()); // Initialize once

  // --- Refactored Fetch Function ---
  const fetchEventAndRegistrationStatus = useCallback(async () => {
    setLoading(true); // Set loading true when fetching
    setError(null);
    try {
      const eventData = await eventService.getEventById(id);
      setEvent(eventData);
      
      if (currentUser) {
        // Check registration status (assuming this function exists and works)
        const registrationStatus = await eventService.checkRegistrationStatus(id);
        setIsRegistered(registrationStatus);
      }
    } catch (err) {
      console.error('Error fetching event details/status:', err);
      const errorMsg = 'Không thể tải thông tin sự kiện hoặc trạng thái đăng ký.';
      setError(errorMsg);
      // Don't toast here, let the component render the error message
    } finally {
      setLoading(false); // Set loading false when done
    }
  }, [id, currentUser]); // Dependencies for the fetch function

  // --- Initial Fetch ---
  useEffect(() => {
    fetchEventAndRegistrationStatus();
  }, [fetchEventAndRegistrationStatus]); // Depend on the useCallback function

  // Format date
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return moment(dateString).format('DD/MM/YYYY HH:mm');
  };

  const isEventPast = event && event.startDate && moment(event.startDate).isBefore(moment());

  // Handle event registration
  const handleRegister = async () => {
    if (!currentUser) {
      toast.info('Vui lòng đăng nhập để đăng ký sự kiện.');
      // Optionally redirect to login
      // navigate('/login'); 
      return;
    }

    if (isEventPast) {
      toast.warn('Sự kiện đã kết thúc, không thể đăng ký.');
      return;
    }
    
    setIsRegistering(true);
    try {
      // Call the registration API
      const updatedEvent = await eventService.registerForEvent(id);
      
      setIsRegistered(true);
      toast.success('Đăng ký sự kiện thành công!');
      
      // Update event state with new registration count 
      setEvent(updatedEvent);
      
    } catch (err) {
      console.error('Error registering for event:', err);
      toast.error(err.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setIsRegistering(false);
    }
  };

  // Handle cancellation of registration
  const handleCancelRegistration = async () => {
    if (!currentUser) {
      toast.info('Vui lòng đăng nhập để tiếp tục.');
      return;
    }
    
    setIsCancelling(true);
    try {
      // Call the cancelRegistration API - now expects SimpleMessageResponse
      const response = await eventService.cancelRegistration(id);
      
      setIsRegistered(false); // Update state immediately
      toast.success(response.message || 'Đã hủy đăng ký tham gia sự kiện.'); // Use message from response
      
      // Re-fetch event data to update UI (e.g., registration count)
      fetchEventAndRegistrationStatus(); 
      
    } catch (err) {
      console.error('Error cancelling registration:', err);
      toast.error(err.message || 'Hủy đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setIsCancelling(false);
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-8rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Render error state
  if (error) {
     return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center bg-red-100 text-red-700 p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4">Đã xảy ra lỗi</h2>
          <p className="mb-4">{error}</p>
          <Link to="/events" className="mt-4 inline-block text-indigo-600 hover:text-indigo-500 font-medium">
            Quay lại danh sách sự kiện
          </Link>
        </div>
      </div>
    );
  }
  
  // Render event not found state
  if (!event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy sự kiện</h2>
          <p className="text-gray-600 mb-4">Sự kiện bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
          <Link to="/events" className="mt-4 inline-block text-indigo-600 hover:text-indigo-500 font-medium">
            Quay lại danh sách sự kiện
          </Link>
        </div>
      </div>
    );
  }

  // Parse multi-line fields if they are strings
  const parseMultiLine = (text) => {
      if (!text) return [];
      return text.split('\n').map(line => line.trim()).filter(line => line);
  };
  
  const requirementsList = parseMultiLine(event.targetAudience);
  const benefitsList = parseMultiLine(event.benefits); // Assuming benefits field exists
  const organizingCommitteeList = parseMultiLine(event.organizingCommittee);
  const speakerList = parseMultiLine(event.speaker);
  const travelPlanList = parseMultiLine(event.travelPlan);
  const transportationList = parseMultiLine(event.transportation);

  // Main component render
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Image Section */}
       <div className="relative h-64 md:h-96 bg-gray-300">
        <img
          src={event.image || 'https://via.placeholder.com/1200x400?text=EduEvent+Banner'} 
          alt={event.title}
          className="w-full h-full object-cover"
           onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://via.placeholder.com/1200x400?text=Image+Error';
            }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
      </div>
      
      <div className="container mx-auto px-4 py-8 md:py-12 -mt-24 md:-mt-32 relative z-10">
        {/* Header Card */}
        <div className="bg-white rounded-xl shadow-xl p-6 md:p-8 mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{event.title}</h1>
          <p className="text-lg text-gray-600 mb-6">{event.description}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-700">
            <div className="flex items-center space-x-2">
              <FaCalendar className="h-5 w-5 text-indigo-500 flex-shrink-0" />
              <span>{formatDateTime(event.startDate)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <FaClock className="h-5 w-5 text-indigo-500 flex-shrink-0" />
               <span>Đến {formatDateTime(event.endDate)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <FaMapMarkerAlt className="h-5 w-5 text-indigo-500 flex-shrink-0" />
              <span className="truncate" title={event.location}>{event.location}</span>
            </div>
            <div className="flex items-center space-x-2">
              <FaUsers className="h-5 w-5 text-indigo-500 flex-shrink-0" />
              <span>{event.registrations || 0}/{event.capacity} tham dự</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Detailed Description */}
            <section className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center">
                <FaInfoCircle className="mr-2 text-indigo-500" /> Thông tin chi tiết
              </h2>
              {/* Use dangerouslySetInnerHTML if description contains HTML, otherwise map paragraphs */}
               <div className="prose max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: event.longDescription || event.description || '' }}></div>
              {/* Alternative for plain text with line breaks:
              <div className="text-gray-700 space-y-4">
                {(event.longDescription || event.description || '').split('\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
              */}
            </section>

            {/* Target Audience (Yeu cau) */}
            {requirementsList.length > 0 && (
              <section className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center">
                  <FaBullseye className="mr-2 text-indigo-500" /> Đối tượng tham gia
                </h2>
                <ul className="space-y-2 list-disc list-inside">
                  {requirementsList.map((req, index) => (
                    <li key={index} className="text-gray-700">
                      {/* <FaCheckCircle className="inline-block text-green-500 mr-2" /> */} 
                      {req.startsWith('-') ? req.substring(1).trim() : req}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Organizing Committee */}
            {organizingCommitteeList.length > 0 && (
              <section className="bg-white rounded-lg shadow p-6">
                 <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center">
                   <FaUsersCog className="mr-2 text-indigo-500" /> Ban tổ chức
                </h2>
                <ul className="space-y-2 list-disc list-inside">
                  {organizingCommitteeList.map((member, index) => (
                    <li key={index} className="text-gray-700">
                       {/* <FaUserTie className="inline-block text-indigo-500 mr-2" /> */} 
                      {member.startsWith('-') ? member.substring(1).trim() : member}
                    </li>
                  ))}
                </ul>
              </section>
            )}
            
             {/* Speaker Section */}
            {speakerList.length > 0 && (
              <section className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center">
                  <FaMicrophone className="mr-2 text-indigo-500" /> Diễn giả
                </h2>
                <ul className="space-y-2 list-disc list-inside">
                  {speakerList.map((speaker, index) => (
                    <li key={index} className="text-gray-700">
                       {speaker.startsWith('-') ? speaker.substring(1).trim() : speaker}
                    </li>
                  ))}
                </ul>
              </section>
            )}
            
            {/* Travel Plan Section */}
            {travelPlanList.length > 0 && (
              <section className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center">
                   <FaRoute className="mr-2 text-indigo-500" /> Kế hoạch di chuyển
                </h2>
                <ul className="space-y-2 list-disc list-inside">
                  {travelPlanList.map((item, index) => (
                    <li key={index} className="text-gray-700">
                       {item.startsWith('-') ? item.substring(1).trim() : item}
                    </li>
                  ))}
                </ul>
              </section>
            )}
            
            {/* Transportation Section */}
            {transportationList.length > 0 && (
              <section className="bg-white rounded-lg shadow p-6">
                 <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center">
                   <FaBus className="mr-2 text-indigo-500" /> Phương tiện
                </h2>
                <ul className="space-y-2 list-disc list-inside">
                  {transportationList.map((item, index) => (
                    <li key={index} className="text-gray-700">
                       {item.startsWith('-') ? item.substring(1).trim() : item}
                    </li>
                  ))}
                </ul>
              </section>
            )}
            
            {/* Benefits (Quyen loi) - Assuming a 'benefits' field might exist */}
            {benefitsList.length > 0 && (
              <section className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Quyền lợi tham gia</h2>
                <ul className="space-y-2 list-disc list-inside">
                  {benefitsList.map((benefit, index) => (
                    <li key={index} className="text-gray-700">
                      {/* <FaCheckCircle className="inline-block text-green-500 mr-2" /> */} 
                       {benefit.startsWith('-') ? benefit.substring(1).trim() : benefit}
                    </li>
                  ))}
                </ul>
              </section>
            )}
            
            {/* Removed this TODO as Speaker section is added above */}
            
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-24 space-y-6">
              {/* Registration Progress */}
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-600 mb-1">
                  {event.registrations || 0} / {event.capacity}
                </div>
                <div className="text-sm text-gray-600 uppercase tracking-wider">Đã đăng ký</div>
                 <div className="w-full bg-gray-200 rounded-full h-2.5 mt-3">
                  <div
                    className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${Math.min(100, ((event.registrations || 0) / (event.capacity || 1)) * 100)}%` }} // Avoid division by zero
                  ></div>
                </div>
              </div>

              {/* Registration Button or Already Registered Status */}
              {!isRegistered ? (
                <button
                  onClick={handleRegister}
                  disabled={isRegistering || (event.registrations >= event.capacity) || event.status !== 'APPROVED' || isEventPast}
                  className={`w-full text-white py-3 px-4 rounded-lg transition-colors font-medium flex items-center justify-center gap-2 
                    ${isRegistering 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : isEventPast
                        ? 'bg-gray-400 cursor-not-allowed'
                        : (event.registrations >= event.capacity)
                          ? 'bg-gray-400 cursor-not-allowed'
                          : event.status !== 'APPROVED'
                            ? 'bg-yellow-400 cursor-not-allowed'
                            : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                >
                  {isRegistering ? (
                     <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Đang xử lý...</span>
                      </>
                  ) : isEventPast ? (
                    'Sự kiện đã kết thúc'
                  ) : (event.registrations >= event.capacity) ? (
                    'Đã hết chỗ'
                  ) : event.status !== 'APPROVED' ? (
                    'Sự kiện chưa được phê duyệt'
                  ) : (
                    'Đăng ký tham gia'
                  )}
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="text-center bg-green-100 text-green-800 py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2">
                    <FaCheckCircle className="inline-block" />
                    Đã đăng ký tham gia
                  </div>
                  
                  <button
                    onClick={handleCancelRegistration}
                    disabled={isCancelling}
                    className={`w-full text-white py-2 px-3 rounded-lg transition-colors font-medium flex items-center justify-center gap-2 
                      ${isCancelling ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'}`}
                  >
                    {isCancelling ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Đang xử lý...</span>
                      </>
                    ) : (
                      <>
                        <FaTimesCircle className="inline-block" />
                        Hủy đăng ký
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Organizer Info (Unit) */}
              <div className="border-t pt-5">
                <h3 className="font-semibold text-gray-800 mb-3 text-lg">Đơn vị tổ chức</h3>
                <div className="flex items-center space-x-3">
                    <span className="flex-shrink-0 bg-indigo-100 text-indigo-600 rounded-full p-2">
                        <FaBuilding className="h-5 w-5" />
                    </span>
                    <p className="text-gray-700">{event.organizer || 'Không xác định'}</p>
                </div>
             </div>

             {/* Organizer Info (Users) - NEW SECTION */}
             {event.organizers && event.organizers.length > 0 && (
                <div className="border-t pt-5">
                  <h3 className="font-semibold text-gray-800 mb-4 text-lg flex items-center">
                    <FaUsersCog className="mr-2 text-indigo-600"/> 
                    Ban tổ chức (Thành viên)
                  </h3>
                  <ul className="space-y-4">
                    {event.organizers.map((user) => (
                      <li key={user.id} className="flex items-center space-x-3">
                        <img 
                          src={user.imageUrl || `https://ui-avatars.com/api/?name=${user.username}&background=random&color=fff`} 
                          alt={user.username}
                          className="h-10 w-10 rounded-full object-cover flex-shrink-0"
                          onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${user.username}&background=random&color=fff`; }}
                        />
                        <div className="flex-grow overflow-hidden">
                          <p className="font-medium text-gray-900 truncate" title={user.username}>{user.username}</p>
                          <p className="text-sm text-gray-500 truncate" title={user.email}>{user.email}</p>
                          {(user.department || user.office) && (
                            <p className="text-xs text-gray-500 truncate">
                              {user.department?.name}{user.department && user.office ? ' / ' : ''}{user.office?.name}
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
             )}
              
               {/* Optional: Location Map Placeholder */}
               {/* <div className="border-t pt-5">
                 <h3 className="font-semibold text-gray-800 mb-3 text-lg">Bản đồ</h3>
                 <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden bg-gray-200">
                    <img src="https://via.placeholder.com/400x200.png?text=Map" alt="Map" className="w-full h-full object-cover"/>
                 </div>
               </div> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail; 