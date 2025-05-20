import { useState, useEffect } from 'react';
import eventService from '../services/eventService'; // Import event service
import userService from '../services/user.service'; // Import user service

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEvents: 0,
    pendingEvents: 0,
    totalRegistrations: 0,
    recentEvents: [],
    loading: true,
    error: null
  });

  useEffect(() => {
    const loadData = async () => {
      setStats(prev => ({ ...prev, loading: true, error: null }));
      try {
        // Fetch users and all events only
        const [usersResponse, allEventsResponse] = await Promise.all([
          userService.getAllUsers(),                           // Fetch all users for count
          eventService.getAllEvents(),                         // Fetch all events
        ]);

        // Calculate counts from responses
        const totalUsers = Array.isArray(usersResponse?.data) ? usersResponse.data.length : 0;
        const allEvents = Array.isArray(allEventsResponse) ? allEventsResponse : [];
        const totalEvents = allEvents.length;
        
        // Filter pending events from allEvents
        const pendingEvents = allEvents.filter(event => event.status?.toUpperCase() === 'PENDING').length;
        
        // Calculate total registrations by summing from all events
        const totalRegistrations = allEvents.reduce((sum, event) => sum + (event.registrations || 0), 0);

        // Sort events by date to get recent ones
        const recentEvents = [...allEvents]
          .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
          .slice(0, 6);

        setStats({
          totalUsers,
          totalEvents,
          pendingEvents,
          totalRegistrations,
          recentEvents,
          loading: false,
          error: null
        });

      } catch (err) {
        console.error("Error loading dashboard data:", err);
        setStats({
          totalUsers: 0,
          totalEvents: 0,
          pendingEvents: 0,
          totalRegistrations: 0,
          recentEvents: [],
          loading: false,
          error: `Không thể tải dữ liệu dashboard: ${err.message || 'Lỗi không xác định'}`
        });
      }
    };

    loadData();
  }, []);

  if (stats.loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-lg text-gray-700">Đang tải dữ liệu...</span>
      </div>
    );
  }

  if (stats.error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded">
        <div className="flex items-center">
          <svg className="h-6 w-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">Lỗi:</span>
          <span className="ml-2">{stats.error}</span>
        </div>
      </div>
    );
  }

  // Lấy thời gian hiện tại cho lời chào
  const currentHour = new Date().getHours();
  let greeting = "Chào buổi sáng";
  if (currentHour >= 12 && currentHour < 18) {
    greeting = "Chào buổi chiều";
  } else if (currentHour >= 18) {
    greeting = "Chào buổi tối";
  }

  // Định dạng trạng thái sự kiện sang tiếng Việt
  const formatEventStatus = (status) => {
    const upperStatus = status?.toUpperCase(); // Handle potential case differences
    switch(upperStatus) {
      case 'APPROVED': return 'Đã duyệt';
      case 'PENDING': return 'Chờ duyệt';
      case 'REJECTED': return 'Từ chối'; // Added based on potential status
      case 'CANCELLED': return 'Đã hủy';
      case 'COMPLETED': return 'Đã hoàn thành'; // Added based on potential status
      default: return status ? (status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()) : 'N/A'; // Nicer default formatting
    }
  };

  return (
    <div>
      {/* Tiêu đề chào mừng */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">{greeting}, Quản trị viên</h1>
        <p className="text-gray-600 mt-1">Đây là những gì đang diễn ra với các sự kiện giáo dục của bạn hôm nay.</p>
      </div>
      
      {/* Thẻ thống kê */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 transition-all duration-200 hover:shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-50 text-blue-600">
              <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-600">Tổng người dùng</h2>
              <div className="flex items-baseline">
                <p className="text-2xl font-semibold text-gray-800">{stats.totalUsers}</p>
                <span className="ml-2 text-xs font-medium text-green-500">+12%</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 transition-all duration-200 hover:shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-indigo-50 text-indigo-600">
              <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-600">Tổng sự kiện</h2>
              <div className="flex items-baseline">
                <p className="text-2xl font-semibold text-gray-800">{stats.totalEvents}</p>
                <span className="ml-2 text-xs font-medium text-green-500">+5%</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 transition-all duration-200 hover:shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-50 text-yellow-600">
              <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-600">Sự kiện chờ duyệt</h2>
              <div className="flex items-baseline">
                <p className="text-2xl font-semibold text-gray-800">{stats.pendingEvents}</p>
                <span className="ml-2 text-xs font-medium text-yellow-500">Cần xem xét</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 transition-all duration-200 hover:shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-50 text-green-600">
              <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-600">Tổng đăng ký</h2>
              <div className="flex items-baseline">
                <p className="text-2xl font-semibold text-gray-800">{stats.totalRegistrations}</p>
                <span className="ml-2 text-xs font-medium text-green-500">+18%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Hành động nhanh */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Hành động nhanh</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a href="/events" className="flex items-center p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:bg-blue-50 transition-colors duration-150">
            <div className="p-2 rounded-md bg-blue-100 text-blue-600 mr-3">
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-gray-800">Tạo sự kiện mới</h3>
              <p className="text-sm text-gray-500">Thêm sự kiện giáo dục mới</p>
            </div>
          </a>
          
          <a href="/events?status=pending" className="flex items-center p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:bg-yellow-50 transition-colors duration-150">
            <div className="p-2 rounded-md bg-yellow-100 text-yellow-600 mr-3">
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-gray-800">Xem xét sự kiện chờ duyệt</h3>
              <p className="text-sm text-gray-500">Phê duyệt hoặc từ chối sự kiện</p>
            </div>
          </a>
          
          <a href="/users" className="flex items-center p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:bg-green-50 transition-colors duration-150">
            <div className="p-2 rounded-md bg-green-100 text-green-600 mr-3">
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-gray-800">Thêm người dùng mới</h3>
              <p className="text-sm text-gray-500">Tạo tài khoản người dùng mới</p>
            </div>
          </a>
        </div>
      </div>
      
      {/* Sự kiện gần đây */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800">Sự kiện gần đây</h2>
        </div>
        
        {stats.recentEvents && stats.recentEvents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tên sự kiện
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Đăng ký
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.recentEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full overflow-hidden">
                          {event.image ? (
                            <img src={event.image} alt={event.title} className="h-10 w-10 object-cover" />
                          ) : (
                            <div className="h-10 w-10 flex items-center justify-center bg-indigo-100 text-indigo-500">
                              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{event.title}</div>
                          <div className="text-sm text-gray-500">{event.location || 'Không có địa điểm'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{event.startDate ? new Date(event.startDate).toLocaleDateString('vi-VN') : 'N/A'}</div>
                      <div className="text-sm text-gray-500">{event.startDate ? new Date(event.startDate).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'}) : ''}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${ 
                        event.status?.toUpperCase() === 'APPROVED' ? 'bg-green-100 text-green-800' :
                        event.status?.toUpperCase() === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        event.status?.toUpperCase() === 'REJECTED' ? 'bg-red-100 text-red-800' :
                        event.status?.toUpperCase() === 'CANCELLED' ? 'bg-gray-100 text-gray-800' :
                        event.status?.toUpperCase() === 'COMPLETED' ? 'bg-blue-100 text-blue-800' : // Added COMPLETED
                        'bg-gray-100 text-gray-800' // Default fallback style
                      }`}> 
                        {formatEventStatus(event.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {event.registrations ?? 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Không có sự kiện gần đây</h3>
            <p className="mt-1 text-sm text-gray-500">Bắt đầu bằng cách tạo một sự kiện mới.</p>
            <div className="mt-6">
              <a href="/events/new" className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <svg className="-ml-1 mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Sự kiện mới
              </a>
            </div>
          </div>
        )}
        
        {stats.recentEvents && stats.recentEvents.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 text-right">
            <a href="/events" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
              Xem tất cả sự kiện <span aria-hidden="true">→</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 