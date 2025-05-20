import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaCalendar, FaUser, FaBell, FaBars, FaTimes, FaSignOutAlt } from 'react-icons/fa';
import authService from '../services/auth.service'; // Import the auth service
import { toast } from 'react-toastify';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(authService.isAuthenticated()); // Initialize state from service
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser()); // Initialize user state
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // Update auth state when location changes (e.g., after login/logout navigation)
  useEffect(() => {
    setIsLoggedIn(authService.isAuthenticated());
    setCurrentUser(authService.getCurrentUser());
  }, [location]); // Re-run effect when location changes

  const handleLogout = () => {
    authService.logout();
    setIsLoggedIn(false);
    setCurrentUser(null);
    setShowProfileDropdown(false); // Close dropdown on logout
    toast.info('Bạn đã đăng xuất.');
    navigate('/'); // Navigate to homepage after logout
  };

  const navigation = [
    { name: 'Trang chủ', path: '/' },
    { name: 'Sự kiện', path: '/events' },
    { name: 'Báo cáo sự kiện', path: '/event-reports' },
    { name: 'Truyền thông', path: '/communications' },
    { name: 'Về chúng tôi', path: '/about' },
    { name: 'Liên hệ', path: '/contact' },
  ];

  const getInitials = (name) => {
    if (!name) return '?';
    const names = name.split(' ');
    return names.length > 1 
        ? `${names[0][0]}${names[names.length - 1][0]}` 
        : names[0][0];
  };

  return (
    <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img src="https://icc.iuh.edu.vn/web/wp-content/uploads/2024/09/iuh_logo-rut-gon-1024x577.png" alt="IUH Logo" className="h-16" />
            <span className="text-xl font-bold text-gray-900">IUH</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`text-sm font-medium transition-colors hover:text-indigo-600 ${
                  location.pathname === item.path
                    ? 'text-indigo-600'
                    : 'text-gray-700'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Buttons / User Profile */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoggedIn && currentUser ? (
              <>
                <button className="p-2 text-gray-600 hover:text-indigo-600 relative">
                  <FaBell className="h-5 w-5" />
                  {/* Example notification dot - replace with real logic if needed */}
                  <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse"></span>
                </button>
                
                {/* Profile Dropdown */}
                <div className="relative">
                  <button 
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    {currentUser.avatar ? (
                      <>
                        <img 
                          src={currentUser.avatar} 
                          alt="Avatar"
                          className="h-8 w-8 rounded-full object-cover"
                          onError={(e) => { 
                            // Hide image and show fallback if image fails to load
                            e.target.style.display = 'none'; 
                            const fallback = e.target.nextElementSibling; // Get the next element (fallback span)
                            if (fallback) fallback.style.display = 'flex'; 
                          }}
                        />
                        {/* Fallback Initials - Hidden by default */}
                        <span 
                            className="h-8 w-8 rounded-full bg-indigo-500 text-white items-center justify-center text-xs font-semibold"
                            style={{ display: 'none' }} // Initially hidden
                        >
                          {getInitials(currentUser.fullName)}
                        </span>
                      </>
                    ) : (
                       <span className="h-8 w-8 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs font-semibold">
                         {getInitials(currentUser.fullName || currentUser.username)}
                       </span>
                    )}
                    <span className="hidden md:inline text-sm font-medium text-gray-700">{currentUser.fullName || currentUser.username}</span>
                  </button>
                  {showProfileDropdown && (
                    <div 
                      className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-50"
                      onMouseLeave={() => setShowProfileDropdown(false)} // Close on mouse leave
                    >
                      <Link
                        to="/profile" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowProfileDropdown(false)} 
                      >
                        Hồ sơ
                      </Link>
                      {/* Add other links like Settings if needed */}
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-700 hover:text-indigo-600"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-medium text-white bg-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Đăng ký
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-gray-600 hover:text-indigo-600"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <FaTimes className="h-6 w-6" />
            ) : (
              <FaBars className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="container mx-auto px-4 py-4 space-y-4">
            {/* Standard navigation links */}          
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.path}

                className={`block text-sm font-medium ${
                  location.pathname === item.path
                    ? 'text-indigo-600'
                    : 'text-gray-700 hover:text-indigo-600'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            
            {/* Conditional links based on auth state */}          
            <div className="pt-4 border-t space-y-4">
              {isLoggedIn && currentUser ? (
                <>
                  <Link
                    to="/profile"
                    className="flex items-center space-x-3 text-sm font-medium text-gray-700 hover:text-indigo-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                     {currentUser.avatar ? (
                      <img src={currentUser.avatar} alt="Avatar" className="h-6 w-6 rounded-full object-cover" />
                    ) : (
                      <span className="h-6 w-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs font-semibold">
                        {getInitials(currentUser.fullName || currentUser.username)}
                      </span>
                    )}
                    <span>{currentUser.fullName || currentUser.username} (Hồ sơ)</span>
                  </Link>
                  <button
                    onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                    className="flex items-center space-x-3 w-full text-left text-sm font-medium text-red-600 hover:text-red-800"
                  >
                    <FaSignOutAlt className="h-4 w-4"/>
                    <span>Đăng xuất</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block text-sm font-medium text-gray-700 hover:text-indigo-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/register"
                    className="block text-sm font-medium text-white bg-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Đăng ký
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header; 