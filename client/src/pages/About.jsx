import React from 'react';
import { FaBullseye, FaLightbulb, FaUsers, FaGraduationCap, FaRocket, FaCalendar, FaBell } from 'react-icons/fa';

const About = () => {
  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-indigo-600 to-blue-500 text-white py-20 md:py-32">
        <div className="absolute inset-0 opacity-10">
          {/* Optional: Add subtle background pattern or image */}
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 animate-fade-in-down">Về IUH</h1>
          <p className="text-lg md:text-xl text-indigo-100 max-w-3xl mx-auto animate-fade-in-up">
            Kết nối sinh viên với các sự kiện học thuật, workshop, và cơ hội phát triển kỹ năng trong môi trường đại học.
          </p>
        </div>
      </div>

      {/* Mission & Vision Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in-left">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Sứ mệnh & Tầm nhìn</h2>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 bg-indigo-100 text-indigo-600 rounded-full p-3">
                  <FaBullseye className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-1">Sứ mệnh</h3>
                  <p className="text-gray-600">
                    Tạo ra một nền tảng tập trung, dễ dàng truy cập giúp sinh viên khám phá và tham gia các sự kiện giáo dục, làm phong phú thêm trải nghiệm học tập và phát triển cá nhân.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 bg-blue-100 text-blue-600 rounded-full p-3">
                  <FaLightbulb className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-1">Tầm nhìn</h3>
                  <p className="text-gray-600">
                    Trở thành cổng thông tin sự kiện hàng đầu cho cộng đồng sinh viên, thúc đẩy văn hóa học tập suốt đời và kết nối mạng lưới tri thức.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="animate-fade-in-right">
            {/* Placeholder for an image or illustration */}
            <img 
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1171&q=80" 
              alt="Students collaborating at an event"
              className="rounded-lg shadow-xl object-cover w-full h-auto max-h-96"
            />
          </div>
        </div>
      </div>

      {/* What We Offer Section */}
      <div className="bg-white py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">IUH Mang Lại Gì?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-12">Chúng tôi cung cấp một loạt các tính năng để nâng cao trải nghiệm sự kiện của bạn.</p>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 animate-zoom-in">
              <div className="bg-indigo-100 text-indigo-600 rounded-full p-4 inline-flex mb-4">
                <FaCalendar className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Danh sách Sự kiện Đa dạng</h3>
              <p className="text-gray-600 text-sm">Khám phá hội thảo, workshop, seminar, cuộc thi học thuật và các sự kiện ngoại khóa khác.</p>
            </div>
            {/* Feature 2 */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 animate-zoom-in delay-100">
              <div className="bg-blue-100 text-blue-600 rounded-full p-4 inline-flex mb-4">
                <FaRocket className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Đăng ký Dễ dàng</h3>
              <p className="text-gray-600 text-sm">Quy trình đăng ký tham gia sự kiện nhanh chóng và thuận tiện chỉ với vài cú nhấp chuột.</p>
            </div>
            {/* Feature 3 */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 animate-zoom-in delay-200">
              <div className="bg-green-100 text-green-600 rounded-full p-4 inline-flex mb-4">
                <FaBell className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Thông báo & Nhắc nhở</h3>
              <p className="text-gray-600 text-sm">Nhận thông báo về các sự kiện sắp diễn ra và lời nhắc để không bỏ lỡ cơ hội nào.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <h2 className="text-3xl font-bold text-gray-800 mb-12 text-center">Lợi ích cho Sinh viên</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Benefit 1 */}
          <div className="text-center animate-pop-in">
            <div className="bg-indigo-100 text-indigo-600 rounded-full p-4 inline-flex mb-4">
              <FaGraduationCap className="h-10 w-10" />
            </div>
            <h3 className="font-semibold text-gray-700 mb-2">Nâng cao Kiến thức</h3>
            <p className="text-gray-600 text-sm">Tiếp cận các buổi nói chuyện chuyên đề, workshop kỹ năng để mở rộng hiểu biết.</p>
          </div>
          {/* Benefit 2 */}
          <div className="text-center animate-pop-in delay-100">
            <div className="bg-blue-100 text-blue-600 rounded-full p-4 inline-flex mb-4">
              <FaUsers className="h-10 w-10" />
            </div>
            <h3 className="font-semibold text-gray-700 mb-2">Mở rộng Mạng lưới</h3>
            <p className="text-gray-600 text-sm">Gặp gỡ bạn bè cùng chí hướng, giảng viên và các chuyên gia trong ngành.</p>
          </div>
          {/* Benefit 3 */}
          <div className="text-center animate-pop-in delay-200">
            <div className="bg-green-100 text-green-600 rounded-full p-4 inline-flex mb-4">
              <FaLightbulb className="h-10 w-10" />
            </div>
            <h3 className="font-semibold text-gray-700 mb-2">Phát triển Kỹ năng</h3>
            <p className="text-gray-600 text-sm">Tham gia các hoạt động thực hành, cuộc thi để rèn luyện kỹ năng mềm và chuyên môn.</p>
          </div>
          {/* Benefit 4 */}
          <div className="text-center animate-pop-in delay-300">
            <div className="bg-purple-100 text-purple-600 rounded-full p-4 inline-flex mb-4">
              <FaRocket className="h-10 w-10" />
            </div>
            <h3 className="font-semibold text-gray-700 mb-2">Khám phá Cơ hội</h3>
            <p className="text-gray-600 text-sm">Tìm hiểu về các cơ hội nghề nghiệp, thực tập và các dự án nghiên cứu.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About; 