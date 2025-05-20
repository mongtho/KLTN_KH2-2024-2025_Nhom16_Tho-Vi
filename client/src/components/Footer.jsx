import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaCalendar } from 'react-icons/fa';

const Footer = () => {
  const navigation = {
    main: [
      { name: 'Trang chủ', path: '/' },
      { name: 'Sự kiện', path: '/events' },
      { name: 'Về chúng tôi', path: '/about' },
      { name: 'Liên hệ', path: '/contact' },
      { name: 'Điều khoản', path: '/terms' },
      { name: 'Chính sách', path: '/privacy' },
    ],
    social: [
      { name: 'Facebook', icon: FaFacebook, href: '#' },
      { name: 'Twitter', icon: FaTwitter, href: '#' },
      { name: 'Instagram', icon: FaInstagram, href: '#' },
      { name: 'YouTube', icon: FaYoutube, href: '#' },
    ],
  };

  return (
    <footer className="bg-white border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
            <img src="https://icc.iuh.edu.vn/web/wp-content/uploads/2024/09/iuh_logo-rut-gon-1024x577.png" alt="IUH Logo" className="h-16" />
              <span className="text-xl font-bold text-gray-900">IUH</span>
            </Link>
            <p className="text-sm text-gray-600">
              Nền tảng quản lý và tổ chức sự kiện giáo dục hàng đầu
            </p>
            <div className="flex space-x-4">
              {navigation.social.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-400 hover:text-gray-500"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="sr-only">{item.name}</span>
                  <item.icon className="h-6 w-6" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              Liên kết nhanh
            </h3>
            <ul className="space-y-3">
              {navigation.main.slice(0, 4).map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    className="text-sm text-gray-600 hover:text-indigo-600"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              Pháp lý
            </h3>
            <ul className="space-y-3">
              {navigation.main.slice(4).map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    className="text-sm text-gray-600 hover:text-indigo-600"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              Liên hệ
            </h3>
            <ul className="space-y-3">
              <li>
                <p className="text-sm text-gray-600">
                  Địa chỉ: 123 Đường ABC, Quận XYZ, TP.HCM
                </p>
              </li>
              <li>
                <p className="text-sm text-gray-600">
                  Email: contact@eduevents.com
                </p>
              </li>
              <li>
                <p className="text-sm text-gray-600">
                  Điện thoại: (84) 123-456-789
                </p>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t">
          <p className="text-sm text-gray-400 text-center">
            © {new Date().getFullYear()} EduEvents. Đã đăng ký bản quyền.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 