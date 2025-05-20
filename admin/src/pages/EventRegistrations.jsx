import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import eventService from '../services/eventService';
import registrationService from '../services/registrationService';
import { FiUsers, FiArrowLeft, FiCheckCircle, FiXCircle, FiLogIn, FiDownload } from 'react-icons/fi';
import { format, parseISO } from 'date-fns';
import vi from 'date-fns/locale/vi';
import * as XLSX from 'xlsx';

// Helper function to format date
const formatRegistrationDate = (dateString) => {
  if (!dateString) return '-';
  try {
    // Parse the ISO string (or similar format from backend)
    const date = parseISO(dateString);
    // Format it nicely
    return format(date, 'HH:mm dd/MM/yyyy', { locale: vi });
  } catch (error) {
    console.error("Error formatting date:", dateString, error);
    return 'Ngày không hợp lệ';
  }
};

// Helper function to render registration status badges
const renderRegistrationStatus = (status) => {
  switch(status?.toUpperCase()) {
    case 'CONFIRMED':
      return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Đã xác nhận</span>;
    case 'CANCELLED':
      return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Đã hủy</span>;
    case 'WAITLISTED':
      return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Chờ duyệt</span>;
    default:
      return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">{status || 'N/A'}</span>;
  }
};

const EventRegistrations = () => {
  const { eventId } = useParams();
  const [registrations, setRegistrations] = useState([]);
  const [eventDetails, setEventDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkInError, setCheckInError] = useState(null);
  const [checkingInId, setCheckingInId] = useState(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch event details (optional, for title)
        try {
          const details = await eventService.getEventById(eventId);
          setEventDetails(details);
        } catch (detailsError) {
          console.warn("Could not fetch event details:", detailsError);
          setEventDetails({ id: eventId, title: `Sự kiện #${eventId}` }); // Fallback title
        }
        
        // Fetch registrations (now returns UserRegistrationDTO)
        const userRegs = await eventService.getRegisteredUsers(eventId);
        setRegistrations(userRegs || []); // Update state name if needed, assume it's still called registrations
      } catch (err) {
        console.error("Error fetching registrations:", err);
        setError(`Lỗi tải danh sách đăng ký: ${err.response?.data?.message || err.message}`);
        setRegistrations([]);
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchData();
    } else {
      setError("ID sự kiện không hợp lệ.");
      setLoading(false);
    }
  }, [eventId]);

  const handleCheckIn = async (registrationId) => {
    if (!registrationId) {
      console.error("Invalid registrationId for check-in");
      setCheckInError("Không thể điểm danh: ID đăng ký không hợp lệ.");
      return;
    }
    if (!eventId) {
        console.error("Invalid eventId for check-in");
        setCheckInError("Không thể điểm danh: ID sự kiện không hợp lệ.");
        return;
    }
    setCheckingInId(registrationId);
    setCheckInError(null);
    try {
      await registrationService.checkInAttendee(eventId, registrationId);
      // Update the local state to reflect the change
      setRegistrations(prevRegistrations =>
        prevRegistrations.map(reg =>
          reg.registrationId === registrationId ? { ...reg, attended: true, status: 'CONFIRMED' } : reg // Also update status if needed
        )
      );
      // Optionally, you might want to refetch or update status specifically if backend changes it
    } catch (err) {
      console.error("Error checking in attendee:", err);
      setCheckInError(`Lỗi khi điểm danh: ${err.response?.data?.message || err.message}`);
    } finally {
      setCheckingInId(null);
    }
  };

  const handleExportExcel = async () => {
    if (exporting || !registrations.length) return;
    
    setExporting(true);
    try {
      // Prepare data for export
      const exportData = registrations.map((reg, index) => ({
        'STT': index + 1,
        'Họ và tên': reg.username || '',
        'Email': reg.email || '',
        'Khoa': reg.department?.name || '',
        'Phòng ban': reg.office?.name || '',
        'Ngày đăng ký': formatRegistrationDate(reg.registrationDate) || '',
        'Trạng thái': reg.status || '',
        'Đã tham dự': reg.attended ? 'Có' : ''
      }));

      // Create workbook and worksheet
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Danh sách đăng ký');

      // Auto-size columns
      const colWidths = Object.keys(exportData[0]).map(key => ({
        wch: Math.max(key.length, ...exportData.map(row => String(row[key]).length))
      }));
      ws['!cols'] = colWidths;

      // Generate filename
      const fileName = `danh_sach_dang_ky_${eventDetails?.title || 'su_kien'}_${format(new Date(), 'dd-MM-yyyy')}.xlsx`;

      // Save file
      XLSX.writeFile(wb, fileName);
    } catch (err) {
      console.error('Error exporting to Excel:', err);
      setError('Có lỗi xảy ra khi xuất file Excel');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6">
        <Link 
          to="/events" 
          className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 mb-2"
        >
          <FiArrowLeft className="mr-1 h-4 w-4" />
          Quay lại Danh sách Sự kiện
        </Link>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Danh sách đăng ký
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Sự kiện: {eventDetails?.title || 'Đang tải...'}
            </p>
          </div>
          <button
            onClick={handleExportExcel}
            disabled={exporting || loading || !registrations.length}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed ${exporting ? 'animate-pulse' : ''}`}
          >
            <FiDownload className="mr-2 h-4 w-4" />
            {exporting ? 'Đang xuất...' : 'Xuất Excel'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-6" role="alert">
          <p className="font-bold">Đã xảy ra lỗi</p>
          <p>{error}</p>
        </div>
      )}

      {checkInError && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md my-4" role="alert">
          <p className="font-bold">Lỗi Điểm Danh</p>
          <p>{checkInError}</p>
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Người dùng</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Khoa</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Ngày ĐK</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Trạng thái</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Tham dự</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Hành động</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-10 px-6">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mb-3"></div>
                      <span>Đang tải danh sách...</span>
                    </div>
                  </td>
                </tr>
              ) : registrations.length === 0 ? (
                 <tr>
                   <td colSpan="8" className="text-center py-10 px-6 text-gray-500">
                     <FiUsers className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                     <p className="font-semibold">Chưa có đăng ký</p>
                     <p className="text-sm">Hiện tại chưa có người dùng nào đăng ký sự kiện này.</p>
                   </td>
                 </tr>
              ) : (
                registrations.map((reg) => (
                  <tr key={reg.registrationId || reg.userId} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img 
                            className="h-10 w-10 rounded-full object-cover" 
                            src={reg.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(reg.username || 'U')}&background=random`}
                            alt={reg.username}
                            onError={(e) => { e.target.onerror = null; e.target.src='https://ui-avatars.com/api/?name=Error&background=random'; }}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{reg.username || `User #${reg.userId}`}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{reg.email || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{reg.department?.name || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatRegistrationDate(reg.registrationDate)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">{renderRegistrationStatus(reg.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {reg.attended ? 
                        <FiCheckCircle className="h-5 w-5 text-green-500 inline-block" title="Đã tham dự" /> : 
                        <FiXCircle className="h-5 w-5 text-red-500 inline-block" title="Chưa tham dự" />
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      {!reg.attended && (
                        <button
                          onClick={() => handleCheckIn(reg.registrationId)}
                          disabled={checkingInId === reg.registrationId}
                          className={`text-indigo-600 hover:text-indigo-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center w-full ${checkingInId === reg.registrationId ? 'animate-pulse' : ''}`}
                          title="Điểm danh"
                        >
                          {checkingInId === reg.registrationId ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-indigo-500 mr-2"></div>
                              Đang điểm danh...
                            </>
                          ) : (
                            <>
                              <FiLogIn className="mr-1 h-4 w-4" />
                              Điểm danh
                            </>
                          )}
                        </button>
                      )}
                      {reg.attended && (
                        <span className="text-green-600 font-semibold">Đã điểm danh</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!loading && registrations.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-sm text-gray-600">
            Tổng cộng: <span className="font-semibold">{registrations.length}</span> lượt đăng ký
          </div>
        )}
      </div>
    </div>
  );
};

export default EventRegistrations; 