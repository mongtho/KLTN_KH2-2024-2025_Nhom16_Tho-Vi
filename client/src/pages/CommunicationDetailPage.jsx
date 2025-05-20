import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import communicationService from '../services/communication.service';
import { FaRegNewspaper, FaBullhorn, FaCalendarAlt, FaUser, FaClock, FaTags } from 'react-icons/fa';

// Helper function to format dates (copied from CommunicationsPage)
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  } catch (error) {
    return 'Invalid Date';
  }
};

// Helper function to get type icon and text (copied from CommunicationsPage)
const getTypeInfo = (type) => {
  switch (type?.toUpperCase()) {
    case 'NEWS':
      return { icon: <FaRegNewspaper className="mr-1" />, text: 'Tin tức', color: 'text-blue-600' };
    case 'ANNOUNCEMENT':
      return { icon: <FaBullhorn className="mr-1" />, text: 'Thông báo', color: 'text-purple-600' };
    case 'EVENT': 
      return { icon: <FaCalendarAlt className="mr-1" />, text: 'Sự kiện liên quan', color: 'text-pink-600' };
    default:
      return { icon: <FaTags className="mr-1"/>, text: type || 'Khác', color: 'text-gray-600' };
  }
};

const CommunicationDetailPage = () => {
  const { id } = useParams();
  const [communication, setCommunication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCommunication = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await communicationService.getCommunicationById(id);
        if (response.data && response.data.status === 'PUBLISHED') {
          setCommunication(response.data);
          // Optional: Increment views if you implement that
          // communicationService.incrementViews(id); 
        } else {
           setError('Bài viết không tồn tại hoặc chưa được xuất bản.');
        }
      } catch (err) {
        console.error("Lỗi khi tải chi tiết truyền thông:", err);
        setError('Không thể tải dữ liệu bài viết. Vui lòng thử lại sau.');
        setCommunication(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCommunication();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 pt-24 text-center">
        <p className="text-red-600 bg-red-100 p-4 rounded-md">{error}</p>
        <Link to="/communications" className="mt-4 inline-block text-indigo-600 hover:underline">
          &larr; Quay lại danh sách
        </Link>
      </div>
    );
  }

  if (!communication) {
    return <div className="container mx-auto px-4 py-8 pt-24 text-center text-gray-500">Không tìm thấy bài viết.</div>;
  }

  const typeInfo = getTypeInfo(communication.type);

  return (
    <div className="bg-gray-50 min-h-screen pt-16"> {/* Add padding for header */} 
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <article className="bg-white rounded-lg shadow-lg overflow-hidden">
          {communication.imageUrl && (
            <img
              src={communication.imageUrl}
              alt={communication.title}
              className="w-full h-64 md:h-96 object-cover"
              onError={(e) => { e.target.onerror = null; e.target.style.display='none'; }}
            />
          )}
          <div className="p-6 md:p-10">
            {/* Title and Meta Info */} 
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{communication.title}</h1>
            <div className="flex flex-wrap items-center text-sm text-gray-500 mb-6 space-x-4">
              <span className={`inline-flex items-center font-medium ${typeInfo.color}`}> 
                {typeInfo.icon} {typeInfo.text}
              </span>
              <span className="inline-flex items-center"> 
                <FaUser className="mr-1.5" /> {communication.authorName || 'Ban biên tập'}
              </span>
              <span className="inline-flex items-center"> 
                <FaClock className="mr-1.5" /> {formatDate(communication.publishedAt || communication.createdAt)}
              </span>
               {/* Optional: Add views/shares if available */}
               {/* <span className="inline-flex items-center"><FaEye className="mr-1.5" /> {communication.views ?? 0} Lượt xem</span> */}
            </div>

            {/* Content */} 
            <div 
              className="prose prose-indigo max-w-none text-gray-700" 
              dangerouslySetInnerHTML={{ __html: communication.content.replace(/\n/g, '<br />') }} // Basic newline rendering
            >
              {/* Content is rendered using dangerouslySetInnerHTML */}
            </div>

            {/* Back Link */} 
            <div className="mt-10 pt-6 border-t border-gray-200">
               <Link to="/communications" className="text-indigo-600 hover:text-indigo-800 inline-flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                  Quay lại danh sách
               </Link>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
};

export default CommunicationDetailPage; 