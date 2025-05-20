import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import communicationService from '../services/communication.service';
import { FaRegNewspaper, FaBullhorn, FaCalendarAlt } from 'react-icons/fa'; // Icons for types

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

// Helper function to get type icon and text
const getTypeInfo = (type) => {
  switch (type?.toUpperCase()) {
    case 'NEWS':
      return { icon: <FaRegNewspaper className="mr-1" />, text: 'Tin tức', color: 'text-blue-600' };
    case 'ANNOUNCEMENT':
      return { icon: <FaBullhorn className="mr-1" />, text: 'Thông báo', color: 'text-purple-600' };
    case 'EVENT': // Assuming communications can also be of type EVENT
      return { icon: <FaCalendarAlt className="mr-1" />, text: 'Sự kiện liên quan', color: 'text-pink-600' };
    default:
      return { icon: null, text: type || 'Khác', color: 'text-gray-600' };
  }
};

const CommunicationsPage = () => {
  const [communications, setCommunications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCommunications = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await communicationService.getAllCommunications();
        // Filter for published communications only for the client view
        const publishedComms = response.data.filter(comm => comm.status === 'PUBLISHED');
        setCommunications(publishedComms);
      } catch (err) {
        console.error("Lỗi khi tải danh sách truyền thông:", err);
        setError('Không thể tải dữ liệu truyền thông. Vui lòng thử lại sau.');
        setCommunications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCommunications();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 pt-24"> {/* Added pt-24 for fixed header */}
      <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Truyền thông</h1>

      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      )}

      {error && (
        <div className="text-center text-red-600 bg-red-100 p-4 rounded-md">{error}</div>
      )}

      {!loading && !error && communications.length === 0 && (
         <div className="text-center text-gray-500">
           <p>Hiện chưa có bài viết truyền thông nào được đăng.</p>
         </div>
      )}

      {!loading && !error && communications.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {communications.map((comm) => {
            const typeInfo = getTypeInfo(comm.type);
            return (
              <div key={comm.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col">
                {comm.imageUrl && (
                  <Link to={`/communications/${comm.id}`} className="block h-48 overflow-hidden">
                    <img
                      src={comm.imageUrl}
                      alt={comm.title}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      onError={(e) => { e.target.onerror = null; e.target.src='https://via.placeholder.com/400x200?text=Image+Error'; }}
                    />
                  </Link>
                )}
                <div className="p-5 flex flex-col flex-grow">
                  <div className="mb-2">
                     <span className={`inline-flex items-center text-xs font-semibold ${typeInfo.color}`}>
                       {typeInfo.icon} {typeInfo.text}
                     </span>
                  </div>
                  <Link to={`/communications/${comm.id}`} className="block hover:text-indigo-700">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">{comm.title}</h2>
                  </Link>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-grow">
                    {comm.content} {/* Display snippet of content */}
                  </p>
                  <div className="mt-auto pt-3 border-t border-gray-200 text-xs text-gray-500 flex justify-between items-center">
                    <span>{comm.authorName || 'Ban biên tập'}</span>
                    <span>{formatDate(comm.publishedAt || comm.createdAt)}</span>
                  </div>
                  <Link 
                    to={`/communications/${comm.id}`} 
                    className="mt-4 inline-block text-sm text-indigo-600 hover:text-indigo-800 font-medium self-start"
                  >
                    Đọc thêm →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CommunicationsPage; 