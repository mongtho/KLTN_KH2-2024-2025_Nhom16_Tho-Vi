import React, { useState } from 'react';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaPaperPlane } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../services/api'; // Import the api instance

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Vui lòng nhập tên của bạn';
    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email của bạn';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Địa chỉ email không hợp lệ';
    }
    if (!formData.subject.trim()) newErrors.subject = 'Vui lòng nhập chủ đề';
    if (!formData.message.trim()) newErrors.message = 'Vui lòng nhập nội dung tin nhắn';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setLoading(true);
      try {
        // Call the backend API endpoint
        await api.post('/auth/contact', formData);
        
        setLoading(false);
        setFormData({ name: '', email: '', subject: '', message: '' }); // Clear form
        toast.success('Tin nhắn của bạn đã được gửi thành công! Chúng tôi sẽ phản hồi sớm nhất có thể.');
      } catch (error) {
         setLoading(false);
         console.error('Error sending contact form:', error);
         const errorMsg = error.response?.data?.message || error.message || 'Không thể gửi tin nhắn. Vui lòng thử lại.';
         toast.error(`Lỗi: ${errorMsg}`);
         // Optionally set an error state to display in the form
         setErrors(prev => ({...prev, submit: errorMsg })); 
      }
    }
  };

  return (
    <div className="bg-gray-50 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-4">Liên Hệ Với Chúng Tôi</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Có câu hỏi hoặc phản hồi? Chúng tôi luôn sẵn lòng lắng nghe từ bạn.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-16 items-start">
          {/* Contact Information */}
          <div className="space-y-8 animate-fade-in-left">
            <h2 className="text-2xl font-semibold text-gray-700 mb-6">Thông Tin Liên Hệ</h2>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 bg-indigo-100 text-indigo-600 rounded-full p-3 mt-1">
                <FaMapMarkerAlt className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-800">Địa Chỉ</h3>
                <p className="text-gray-600">123 Đường ABC, Quận XYZ, Thành phố HCM</p>
                <p className="text-gray-600">Việt Nam</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 bg-indigo-100 text-indigo-600 rounded-full p-3 mt-1">
                <FaPhone className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-800">Điện Thoại</h3>
                <p className="text-gray-600">(+84) 123 456 789</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 bg-indigo-100 text-indigo-600 rounded-full p-3 mt-1">
                <FaEnvelope className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-800">Email</h3>
                <p className="text-gray-600">contact@eduevents.com</p>
              </div>
            </div>
            {/* Optional: Map placeholder */}
            <div className="mt-8 rounded-lg overflow-hidden shadow-md">
              <img 
                 src="https://via.placeholder.com/600x400.png?text=Map+Placeholder" 
                 alt="Map location placeholder"
                 className="w-full h-64 object-cover"
              />
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white p-8 rounded-lg shadow-lg animate-fade-in-right">
            <h2 className="text-2xl font-semibold text-gray-700 mb-6">Gửi Tin Nhắn Cho Chúng Tôi</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Họ và Tên</label>
                <input 
                  type="text" 
                  name="name" 
                  id="name" 
                  value={formData.name}
                  onChange={handleChange}
                  className={`block w-full px-4 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Tên của bạn"
                />
                {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name}</p>}
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input 
                  type="email" 
                  name="email" 
                  id="email"
                  value={formData.email}
                  onChange={handleChange} 
                  className={`block w-full px-4 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="email@example.com"
                />
                {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Chủ đề</label>
                <input 
                  type="text" 
                  name="subject" 
                  id="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className={`block w-full px-4 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${errors.subject ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Chủ đề tin nhắn"
                />
                 {errors.subject && <p className="text-red-600 text-xs mt-1">{errors.subject}</p>}
             </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Tin nhắn</label>
                <textarea 
                  name="message" 
                  id="message" 
                  rows="5"
                  value={formData.message}
                  onChange={handleChange}
                  className={`block w-full px-4 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${errors.message ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Nội dung tin nhắn của bạn..."
                ></textarea>
                {errors.message && <p className="text-red-600 text-xs mt-1">{errors.message}</p>}
              </div>
              <div>
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center py-3 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors duration-200"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <FaPaperPlane className="mr-2 h-4 w-4" /> Gửi Tin Nhắn
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact; 