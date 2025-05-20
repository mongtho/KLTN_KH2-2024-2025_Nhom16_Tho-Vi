import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaCalendar, FaMapMarkerAlt, FaUsers, FaSearch, FaLightbulb, FaQuoteLeft, FaTag, FaMousePointer, FaBuilding, FaUserTie, FaCalendarCheck } from 'react-icons/fa';
import eventService from '../services/eventService';
import moment from 'moment';

// TODO: Consider fetching featured events, news, etc. separately for the homepage

const Home = () => {
  const [groupedEvents, setGroupedEvents] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAndGroupEvents = async () => {
      setLoading(true);
      setError(null);
      try {
        const events = await eventService.getAllEvents({ limit: 6 }); // Limit events on homepage for performance
        const approvedEvents = events.filter(event => event.status === 'APPROVED'); // Filter for approved events
        
        const groups = approvedEvents.reduce((acc, event) => {
          const organizer = event.organizer || 'Chưa xác định';
          if (!acc[organizer]) {
            acc[organizer] = [];
          }
          // Only add a few events per organizer on the homepage
          if (acc[organizer].length < 3) { 
             acc[organizer].push(event);
          }
          return acc;
        }, {});
        setGroupedEvents(groups);
      } catch (err) {
        console.error("Error fetching or grouping events:", err);
        setError("Không thể tải dữ liệu sự kiện.");
      } finally {
        setLoading(false);
      }
    };
    fetchAndGroupEvents();
  }, []);

  // --- Helper functions (can be moved to a utils file) ---
   const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return moment(dateString).format('DD/MM/YYYY HH:mm');
  };
   const getCategoryColor = (category) => {
    const catLower = category?.toLowerCase() || 'other';
    const colors = {
      technology: 'bg-blue-100 text-blue-800',
      skills: 'bg-purple-100 text-purple-800',
      career: 'bg-green-100 text-green-800',
      sports: 'bg-orange-100 text-orange-800',
      culture: 'bg-pink-100 text-pink-800',
      workshop: 'bg-yellow-100 text-yellow-800',
      seminar: 'bg-teal-100 text-teal-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[catLower] || colors.other;
  };
  const getCategoryText = (category) => {
     const catLower = category?.toLowerCase() || 'other';
    const texts = {
      technology: 'Công nghệ',
      skills: 'Kỹ năng',
      career: 'Việc làm',
      sports: 'Thể thao',
      culture: 'Văn hóa',
      workshop: 'Workshop',
      seminar: 'Seminar',
      other: 'Khác'
    };
    return texts[catLower] || category || 'Khác';
  };
  // --- End Helper functions ---

  // --- Mock Featured Speakers Data ---
  const featuredSpeakers = [
    {
        id: 1,
        name: "GS. Trần Văn A",
        title: "Chuyên gia AI, Đại học Bách Khoa",
        imageUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-1.2.1&q=80&fm=jpg&crop=faces&fit=crop&h=200&w=200", // Example online image
    },
    {
        id: 2,
        name: "ThS. Lê Thị B",
        title: "CEO Startup Công nghệ XYZ",
        imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&q=80&fm=jpg&crop=faces&fit=crop&h=200&w=200", // Example online image
    },
    {
        id: 3,
        name: "TS. Nguyễn Hoàng C",
        title: "Nghiên cứu viên Viện Hàn lâm KH&CN",
        imageUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?ixlib=rb-1.2.1&q=80&fm=jpg&crop=faces&fit=crop&h=200&w=200", // Example online image
    },
     {
        id: 4,
        name: "Chị Phạm Thu D",
        title: "Trưởng phòng Nhân sự Tập đoàn EFG",
        imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=faces&fit=crop&h=200&w=200", // Example online image
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Slogan */}
      <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 text-white overflow-hidden">
        <div className="container mx-auto px-4 py-24 md:py-32 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in-down">
              Khám phá. Học hỏi. Phát triển.
            </h1>
            <p className="text-xl md:text-2xl text-indigo-100 mb-10 animate-fade-in-up">
              Tham gia các sự kiện giáo dục hàng đầu và kết nối với cộng đồng chuyên gia tại trường của bạn.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-100">
              <Link 
                to="/events" 
                className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                Xem Tất Cả Sự Kiện <FaArrowRight />
              </Link>
              {/* Optional: Add a secondary action if needed */}
              {/* <Link 
                to="/about" 
                className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
              >
                Tìm Hiểu Thêm
              </Link> */}
            </div>
          </div>
        </div>
        {/* Optional: Add subtle background shapes or patterns */}
        <div className="absolute inset-0 opacity-10 z-0">
            {/* Example subtle pattern */}
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="a" patternUnits="userSpaceOnUse" width="40" height="40" patternTransform="scale(2) rotate(0)"><rect x="0" y="0" width="100%" height="100%" fill="hsla(0,0%,100%,0)"/><path d="M10-10a20 20 0 0140 0zM-10 30a20 20 0 0140 0zM30 30a20 20 0 0140 0z" strokeWidth="1" stroke="hsla(259, 100%, 100%, 0.08)" fill="none"/></pattern></defs><rect width="800%" height="800%" transform="translate(0,0)" fill="url(#a)"/></svg>
        </div>
         {/* Wave decoration */}
         <div className="relative h-20 mt-[-1px]">
          <svg className="absolute bottom-0 w-full h-full fill-current text-gray-50" viewBox="0 0 1440 74" preserveAspectRatio="none">
            <path d="M456.464 0.0433865C277.158 -1.70575 0 50.0141 0 50.0141V74H1440V50.0141C1440 50.0141 1320.4 31.1925 1243.09 27.0276C1099.33 19.2816 1019.08 53.1981 875.138 50.0141C710.527 46.3727 621.108 1.64949 456.464 0.0433865Z"></path>
          </svg>
        </div>
      </div>

      {/* How it Works Section - Added */}
      <section className="bg-white py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-3">Tham Gia Dễ Dàng</h2>
            <p className="text-gray-600">Chỉ với 3 bước đơn giản để bắt đầu hành trình khám phá sự kiện.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center animate-fade-in-up">
              <div className="bg-indigo-100 text-indigo-600 rounded-full p-5 mb-4">
                <FaSearch className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">1. Tìm Kiếm</h3>
              <p className="text-gray-500 text-sm">Duyệt qua danh sách hoặc tìm kiếm sự kiện theo tên, danh mục, đơn vị tổ chức.</p>
            </div>
            <div className="flex flex-col items-center animate-fade-in-up delay-100">
              <div className="bg-blue-100 text-blue-600 rounded-full p-5 mb-4">
                <FaMousePointer className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">2. Chọn Sự Kiện</h3>
              <p className="text-gray-500 text-sm">Xem chi tiết thông tin, thời gian, địa điểm và nội dung của sự kiện bạn quan tâm.</p>
            </div>
            <div className="flex flex-col items-center animate-fade-in-up delay-200">
              <div className="bg-green-100 text-green-600 rounded-full p-5 mb-4">
                <FaCalendar className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">3. Đăng Ký</h3>
              <p className="text-gray-500 text-sm">Nhấn nút đăng ký, điền thông tin (nếu cần) và sẵn sàng tham gia!</p>
            </div>
          </div>
        </div>
      </section>

      
      {/* Events by Organizer Section (Moved + Title Updated) */}
      <section className="container mx-auto px-4 py-16 my-16"> {/* Added bg, shadow, margin */}
         <h2 className="text-3xl font-bold text-gray-800 mb-10 text-center flex items-center justify-center gap-3">
           <FaCalendarCheck className="text-purple-500"/> Sự Kiện Nổi Bật {/* Updated Title */}
        </h2>

        {loading && (
          <div className="flex justify-center items-center h-64">
             <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
           </div>
        )}

        {error && (
           <div className="text-center text-red-600 bg-red-100 p-4 rounded-lg">
             <p>{error}</p>
           </div>
        )}

        {!loading && !error && Object.keys(groupedEvents).length === 0 && (
           <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Hiện chưa có sự kiện nào.</p>
            </div>
        )}

        {!loading && !error && Object.keys(groupedEvents).length > 0 && (
          <div className="space-y-12">
            {Object.entries(groupedEvents).map(([organizer, eventsList]) => (
              <div key={organizer}>
                <h3 className="text-2xl font-semibold text-gray-700 mb-6 pb-2 border-b border-indigo-200 flex items-center">
                   <span className="mr-3 text-indigo-500"><FaBuilding/></span> {organizer}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {eventsList.map((event) => (
                     <div
                      key={event.id}
                      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex flex-col border border-gray-200" /* Added subtle border */
                    >
                      <Link to={`/events/${event.id}`} className="block relative h-48 flex-shrink-0 group">
                        <img
                          src={event.image || 'https://via.placeholder.com/400x200?text=EduEvent'}
                          alt={event.title}
                          className="w-full h-full object-cover group-hover:opacity-80 transition-opacity duration-300"
                          onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/400x200?text=No+Image'; }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                           <span className="text-white text-sm font-medium bg-indigo-600 px-3 py-1 rounded-full">Xem chi tiết</span>
                        </div>
                      </Link>
                      <div className="p-4 flex flex-col flex-grow">
                         <span className={`text-xs font-semibold px-2 py-0.5 rounded-full self-start mb-2 ${getCategoryColor(event.category || event.type)}`}>
                          {getCategoryText(event.category || event.type)}
                        </span>
                        <h4 className="text-lg font-semibold text-gray-800 mb-2 truncate hover:text-indigo-600 transition-colors">
                          <Link to={`/events/${event.id}`}>{event.title}</Link>
                        </h4>
                        <div className="space-y-1 text-sm text-gray-600 mb-3 flex-grow">
                           <div className="flex items-center">
                            <FaCalendar className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                            <span>{formatDateTime(event.startDate)}</span> 
                          </div>
                          <div className="flex items-center">
                            <FaMapMarkerAlt className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                            <span className="truncate" title={event.location}>{event.location}</span>
                          </div>
                        </div>
                         <Link
                            to={`/events/${event.id}`}
                            className="mt-auto text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center self-start"
                          >
                            Xem chi tiết <FaArrowRight className="ml-1 w-3 h-3" />
                         </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

       {/* Featured Speakers Section - Added */}
      <section className="py-16 md:py-20 bg-gray-100"> {/* Changed background slightly */}
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-3 flex items-center justify-center gap-3">
               <FaUserTie className="text-indigo-500"/> Diễn Giả Nổi Bật
            </h2>
            <p className="text-gray-600">Gặp gỡ những chuyên gia hàng đầu trong các lĩnh vực.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {featuredSpeakers.map((speaker) => (
              <div key={speaker.id} className="text-center bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col items-center">
                 <img 
                    src={speaker.imageUrl} 
                    alt={speaker.name} 
                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-indigo-200" 
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/150/cccccc?text=Speaker'; }}
                 />
                <h3 className="text-lg font-semibold text-gray-800 mb-1">{speaker.name}</h3>
                <p className="text-sm text-indigo-600">{speaker.title}</p>
                {/* Optional: Add link to speaker profile if available */}
                 {/* <Link to={`/speakers/${speaker.id}`} className="text-xs text-gray-500 hover:text-indigo-500 mt-2">Xem hồ sơ</Link> */}
              </div>
            ))}
          </div>
        </div>
      </section>

      
      {/* Testimonial Section - Added */}
      <section className="py-20 bg-indigo-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center text-gray-800">
            <FaQuoteLeft className="w-10 h-10 mx-auto mb-6 text-indigo-300" />
            <blockquote className="text-xl italic text-gray-700 mb-6">
              "EduEvents đã thay đổi cách tôi tìm kiếm và tham gia các workshop kỹ năng. Giao diện thân thiện và thông tin sự kiện rất đầy đủ. Highly recommended!"
            </blockquote>
            <div className="flex items-center justify-center">
              {/* Placeholder avatar */}
              <span className="w-12 h-12 rounded-full bg-indigo-500 text-white flex items-center justify-center font-semibold mr-3">AN</span>
              <div>
                <div className="font-semibold text-gray-900">An Nguyễn</div>
                <div className="text-sm text-indigo-600">Sinh viên Khoa CNTT</div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home; 