import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/auth.service';
import { FaUser, FaEnvelope, FaPhone, FaIdCard } from 'react-icons/fa';

const Profile = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user) {
      // Redirect to login if not authenticated
      navigate('/login');
    } else {
      setCurrentUser(user);
      setLoading(false);
    }
  }, [navigate]);

  const getInitials = (name) => {
    if (!name) return '?';
    const names = name.split(' ');
    return names.length > 1 
        ? `${names[0][0]}${names[names.length - 1][0]}` 
        : name[0].toUpperCase();
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[calc(100vh-8rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!currentUser) {
    // This case might not be reached due to the redirect, but it's good practice
    return null; 
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Hồ sơ của bạn</h1>
      
      <div className="bg-white shadow-lg rounded-lg overflow-hidden md:flex">
        {/* Left Side - Avatar & Name */}
        <div className="md:w-1/3 bg-gradient-to-br from-indigo-500 to-blue-600 p-8 flex flex-col items-center justify-center text-white">
           {currentUser.avatar ? (
            <img 
              src={currentUser.avatar} 
              alt="Avatar"
              className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-md mb-4"
              onError={(e) => { 
                e.target.style.display = 'none'; 
                const fallback = document.getElementById('profile-fallback-avatar');
                if (fallback) fallback.style.display = 'flex'; 
              }}
            />
          ) : null} 
          {/* Fallback Initials - Display if avatar fails or doesn't exist */}
          <div 
              id="profile-fallback-avatar"
              className={`h-32 w-32 rounded-full bg-white text-indigo-600 flex items-center justify-center text-4xl font-bold mb-4 ${currentUser.avatar ? 'hidden' : 'flex'}`}
          >
            {getInitials(currentUser.fullName || currentUser.username)}
          </div>
          <h2 className="text-2xl font-semibold mt-2 text-center">{currentUser.fullName || 'Chưa cập nhật'}</h2>
          <p className="text-indigo-100">@{currentUser.username}</p>
          <span className="mt-3 px-3 py-1 bg-white text-indigo-600 rounded-full text-sm font-medium capitalize">
            {currentUser.role?.toLowerCase() || 'User'}
          </span>
        </div>

        {/* Right Side - Details */}
        <div className="md:w-2/3 p-8">
          <h3 className="text-xl font-semibold text-gray-700 mb-6">Thông tin chi tiết</h3>
          <div className="space-y-5">
            <div className="flex items-center">
              <FaUser className="h-5 w-5 text-indigo-500 mr-3 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Họ và tên</p>
                <p className="text-gray-800 font-medium">{currentUser.fullName || 'Chưa cập nhật'}</p>
              </div>
            </div>
             <div className="flex items-center">
              <FaIdCard className="h-5 w-5 text-indigo-500 mr-3 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Tên đăng nhập</p>
                <p className="text-gray-800 font-medium">{currentUser.username}</p>
              </div>
            </div>
            <div className="flex items-center">
              <FaEnvelope className="h-5 w-5 text-indigo-500 mr-3 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-gray-800 font-medium">{currentUser.email}</p>
              </div>
            </div>
            <div className="flex items-center">
              <FaPhone className="h-5 w-5 text-indigo-500 mr-3 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Số điện thoại</p>
                <p className="text-gray-800 font-medium">{currentUser.phone || 'Chưa cập nhật'}</p>
              </div>
            </div>
          </div>
          
          {/* Edit Button (Optional - Add functionality later if needed) */}
          <div className="mt-8 text-right">
             <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-5 rounded-lg transition duration-200">
              Chỉnh sửa hồ sơ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 