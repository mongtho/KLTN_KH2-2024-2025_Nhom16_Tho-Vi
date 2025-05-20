import React, { useState, useEffect } from 'react';
import statisticsService from '../services/statisticsService';
import { FiUsers, FiCalendar, FiCheckSquare, FiBarChart2, FiPieChart, FiTrendingUp, FiClock, FiArchive, FiXOctagon, FiActivity, FiBriefcase } from 'react-icons/fi';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { format, parseISO } from 'date-fns';
import vi from 'date-fns/locale/vi';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Helper to format numbers
const formatNumber = (num) => num?.toLocaleString('vi-VN') || '0';

// Simple Summary Card Component
const SummaryCard = ({ title, value, icon, color }) => (
  <div className="bg-white shadow-md rounded-lg p-5 flex items-center space-x-4">
    <div className={`rounded-full p-3 ${color || 'bg-gray-100 text-gray-600'}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-2xl font-semibold text-gray-900">{formatNumber(value)}</p>
    </div>
  </div>
);

const Statistics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await statisticsService.getSummary();
        setStats(data);
      } catch (err) {
        setError('Không thể tải dữ liệu thống kê.');
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Chart Data Preparation
  const eventsByStatusData = {
    labels: stats?.eventsByStatus?.map(item => item.status) || [],
    datasets: [
      {
        label: 'Số lượng sự kiện',
        data: stats?.eventsByStatus?.map(item => item.count) || [],
        backgroundColor: [
          'rgba(255, 159, 64, 0.6)', // PENDING (Orange)
          'rgba(75, 192, 192, 0.6)', // APPROVED (Green/Teal)
          'rgba(54, 162, 235, 0.6)', // COMPLETED (Blue)
          'rgba(255, 99, 132, 0.6)', // CANCELLED (Red)
        ],
        borderColor: [
          'rgba(255, 159, 64, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const usersByRoleData = {
    labels: stats?.usersByRole?.map(item => item.role) || [],
    datasets: [
      {
        label: 'Số lượng người dùng',
        data: stats?.usersByRole?.map(item => item.count) || [],
        backgroundColor: [
          'rgba(153, 102, 255, 0.6)', // ADMIN (Purple)
          'rgba(255, 206, 86, 0.6)', // MANAGER (Yellow)
          'rgba(75, 192, 192, 0.6)', // ORGANIZER (Teal)
          'rgba(54, 162, 235, 0.6)', // STAFF (Blue)
          'rgba(201, 203, 207, 0.6)', // USER (Gray)
        ],
         borderColor: [
          'rgba(153, 102, 255, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(201, 203, 207, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const registrationsLineData = {
    labels: stats?.registrationsLast30Days?.map(item => format(parseISO(item.date), 'dd/MM', { locale: vi })) || [],
    datasets: [
      {
        label: 'Lượt đăng ký mới (30 ngày qua)',
        data: stats?.registrationsLast30Days?.map(item => item.count) || [],
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  // Loading and Error States
  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        <span className="ml-3 text-lg text-gray-700">Đang tải thống kê...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
          <p className="font-bold">Đã xảy ra lỗi</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!stats) {
     return (
      <div className="container mx-auto px-4 py-6">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md" role="alert">
          <p className="font-bold">Không có dữ liệu</p>
          <p>Không thể tải hoặc không có dữ liệu thống kê để hiển thị.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Thống kê tổng quan</h1>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <SummaryCard title="Tổng Sự kiện" value={stats.totalEvents} icon={<FiCalendar className="h-6 w-6" />} color="bg-blue-100 text-blue-600" />
        <SummaryCard title="Sự kiện Sắp tới" value={stats.upcomingEvents} icon={<FiClock className="h-6 w-6" />} color="bg-yellow-100 text-yellow-600" />
        <SummaryCard title="Tổng Người dùng" value={stats.totalUsers} icon={<FiUsers className="h-6 w-6" />} color="bg-green-100 text-green-600" />
        <SummaryCard title="Tổng Đăng ký" value={stats.totalRegistrations} icon={<FiCheckSquare className="h-6 w-6" />} color="bg-purple-100 text-purple-600" />
        <SummaryCard title="Phòng ban" value={stats.totalOffices} icon={<FiBriefcase className="h-6 w-6" />} color="bg-indigo-100 text-indigo-600" />
        <SummaryCard title="Khoa" value={stats.totalDepartments} icon={<FiArchive className="h-6 w-6" />} color="bg-pink-100 text-pink-600" />
        <SummaryCard title="Sự kiện Chờ duyệt" value={stats.pendingEvents} icon={<FiActivity className="h-6 w-6" />} color="bg-orange-100 text-orange-600" />
        <SummaryCard title="Sự kiện Đã hủy" value={stats.cancelledEvents} icon={<FiXOctagon className="h-6 w-6" />} color="bg-red-100 text-red-600" />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* Events by Status Chart */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <FiBarChart2 className="mr-2 h-5 w-5 text-indigo-500" />
            Sự kiện theo Trạng thái
          </h2>
          <div className="h-72 relative">
            <Bar data={eventsByStatusData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'top' } } }} />
          </div>
        </div>

        {/* Users by Role Chart */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <FiPieChart className="mr-2 h-5 w-5 text-green-500" />
            Người dùng theo Vai trò
          </h2>
          <div className="h-72 relative flex justify-center">
            {/* Using Pie chart, Doughnut could also be used */}
            <Pie data={usersByRoleData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }} />
          </div>
        </div>
      </div>

       {/* Registrations Over Time Chart */}
       <div className="bg-white shadow-md rounded-lg p-6 mt-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <FiTrendingUp className="mr-2 h-5 w-5 text-blue-500" />
            Lượt đăng ký mới (30 ngày qua)
          </h2>
          <div className="h-80 relative">
            <Line data={registrationsLineData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
          </div>
        </div>

    </div>
  );
};

export default Statistics; 