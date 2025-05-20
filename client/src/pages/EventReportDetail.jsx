import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import eventReportService from '../services/event-report.service';
import authService from '../services/auth.service';
import { toast } from 'react-toastify';

const EventReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [revisionReason, setRevisionReason] = useState('');

  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
    fetchReportDetail();
  }, [id]);

  const fetchReportDetail = async () => {
    try {
      const response = await eventReportService.getReportById(id);
      setReport(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching report details:', error);
      toast.error('Không thể tải thông tin báo cáo');
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'Đã duyệt';
      case 'REJECTED':
        return 'Từ chối';
      case 'PENDING':
        if (report && report.revisionRequestReason) {
          return 'Chờ cập nhật (Y/C chỉnh sửa)';
        }
        return 'Chờ duyệt';
      default:
        return status;
    }
  };

  const handleApprove = async () => {
    if (!currentUser || !currentUser.id) {
      toast.error("Không tìm thấy thông tin người dùng. Không thể phê duyệt.");
      return;
    }
    try {
      setLoading(true);
      await eventReportService.approveReport(report.id, currentUser.id);
      toast.success('Báo cáo đã được phê duyệt!');
      fetchReportDetail();
    } catch (error) {
      toast.error('Phê duyệt báo cáo thất bại.');
      console.error("Error approving report:", error);
      setLoading(false);
    }
  };

  const handleOpenRejectModal = () => {
    setRejectReason('');
    setShowRejectModal(true);
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error('Vui lòng nhập lý do từ chối.');
      return;
    }
    if (!currentUser || !currentUser.id) {
      toast.error("Không tìm thấy thông tin người dùng. Không thể từ chối.");
      setShowRejectModal(false);
      return;
    }
    try {
      setLoading(true);
      await eventReportService.rejectReport(report.id, rejectReason, currentUser.id);
      toast.success('Báo cáo đã bị từ chối!');
      setShowRejectModal(false);
      fetchReportDetail();
    } catch (error) {
      toast.error('Từ chối báo cáo thất bại.');
      console.error("Error rejecting report:", error);
      setLoading(false);
      setShowRejectModal(false);
    }
  };

  const handleOpenRevisionModal = () => {
    setRevisionReason('');
    setShowRevisionModal(true);
  };
  
  const handleRequestRevision = async () => {
    if (!revisionReason.trim()) {
      toast.error('Vui lòng nhập lý do yêu cầu chỉnh sửa.');
      return;
    }
    if (!currentUser || !currentUser.id) {
      toast.error("Không tìm thấy thông tin người dùng. Không thể yêu cầu chỉnh sửa.");
      setShowRevisionModal(false);
      return;
    }
    try {
      setLoading(true);
      await eventReportService.requestRevision(report.id, revisionReason, currentUser.id);
      toast.success('Đã yêu cầu chỉnh sửa báo cáo!');
      setShowRevisionModal(false);
      fetchReportDetail();
    } catch (error) {
      toast.error('Yêu cầu chỉnh sửa thất bại.');
      console.error("Error requesting revision:", error);
      setLoading(false);
      setShowRevisionModal(false);
    }
  };
  
  const handleEditReport = () => {
    navigate(`/event-reports/edit/${report.id}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 mt-16">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="container mx-auto px-4 py-8 mt-16">
        <div className="text-center">
          <p className="text-gray-500 text-lg">Không tìm thấy báo cáo</p>
          <Link to="/event-reports" className="text-indigo-600 hover:text-indigo-800 mt-4 inline-block">
            Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <div className="mb-6">
        <Link
          to="/event-reports"
          className="inline-flex items-center text-indigo-600 hover:text-indigo-800"
        >
          <FaArrowLeft className="mr-2" />
          Quay lại danh sách
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Chi tiết báo cáo sự kiện</h1>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(report.status)}`}>
            {getStatusText(report.status)}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Thông tin sự kiện</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Tên sự kiện</label>
                <p className="mt-1 text-sm text-gray-900">{report.eventName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Đơn vị tổ chức</label>
                <p className="mt-1 text-sm text-gray-900">{report.organizer}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Ngày diễn ra</label>
                <p className="mt-1 text-sm text-gray-900">{report.date}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Địa điểm</label>
                <p className="mt-1 text-sm text-gray-900">{report.location}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Số người tham dự</label>
                <p className="mt-1 text-sm text-gray-900">{report.attendees}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Thông tin báo cáo</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Người nộp</label>
                <p className="mt-1 text-sm text-gray-900">{report.submittedBy}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Ngày nộp</label>
                <p className="mt-1 text-sm text-gray-900">{report.submittedAt}</p>
              </div>
              {report.status === 'APPROVED' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Người phê duyệt</label>
                    <p className="mt-1 text-sm text-gray-900">{report.approvedBy}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Ngày phê duyệt</label>
                    <p className="mt-1 text-sm text-gray-900">{report.approvedAt}</p>
                  </div>
                </>
              )}
              {report.status === 'REJECTED' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Người từ chối</label>
                    <p className="mt-1 text-sm text-gray-900">{report.rejectedBy}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Ngày từ chối</label>
                    <p className="mt-1 text-sm text-gray-900">{report.rejectedAt}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Lý do từ chối</label>
                    <p className="mt-1 text-sm text-gray-900">{report.rejectionReason}</p>
                  </div>
                </>
              )}
              {report.status === 'PENDING' && report.revisionRequestReason && (
                <>
                  <div className="mt-2 p-3 bg-yellow-50 border border-yellow-300 rounded-md">
                    <p className="text-sm font-semibold text-yellow-800">Yêu cầu chỉnh sửa bởi: {report.revisionRequestedBy}</p>
                    <p className="text-xs text-yellow-700">Ngày: {report.revisionRequestedAt ? new Date(report.revisionRequestedAt).toLocaleString() : 'N/A'}</p>
                    <p className="mt-1 text-sm text-yellow-700">Lý do: {report.revisionRequestReason}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tóm tắt sự kiện</h3>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{report.summary}</p>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Kết quả đạt được</h3>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{report.outcomes}</p>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Khó khăn, thách thức</h3>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{report.challenges}</p>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Đề xuất, kiến nghị</h3>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{report.recommendations}</p>
          </div>

          {report.attachments && report.attachments.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Tệp đính kèm</h3>
              <ul className="list-disc list-inside space-y-2">
                {report.attachments.map((file, index) => (
                  <li key={index}>
                    <a
                      href={`http://localhost:8080/uploads/${file}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-800 hover:underline"
                    >
                      {file}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {currentUser && report && (
          <div className="mt-8 pt-6 border-t">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Hành động</h3>
            <div className="flex flex-wrap gap-4">
              {currentUser.roles && (currentUser.roles.includes('ROLE_ADMIN') || currentUser.roles.includes('ROLE_MANAGER')) && (
                <>
                  {report.status === 'PENDING' && !report.revisionRequestReason && (
                    <button
                      onClick={handleApprove}
                      className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-150 ease-in-out"
                      disabled={loading}
                    >
                      {loading ? 'Đang xử lý...' : 'Phê duyệt'}
                    </button>
                  )}
                  {report.status === 'PENDING' && !report.revisionRequestReason && (
                    <button
                      onClick={handleOpenRejectModal}
                      className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-150 ease-in-out"
                      disabled={loading}
                    >
                      Từ chối
                    </button>
                  )}
                  {report.status === 'APPROVED' && (
                    <button
                      onClick={handleOpenRevisionModal}
                      className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 px-4 rounded-lg transition duration-150 ease-in-out"
                      disabled={loading}
                    >
                      Yêu cầu chỉnh sửa
                    </button>
                  )}
                </>
              )}

              {currentUser.username === report.submittedBy && (report.status === 'REJECTED' || (report.status === 'PENDING' && report.revisionRequestReason)) && (
                <button
                  onClick={handleEditReport}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-150 ease-in-out"
                  disabled={loading}
                >
                  Cập nhật lại báo cáo
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {showRejectModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="bg-white p-6 md:p-8 rounded-lg shadow-xl w-full max-w-md mx-4">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Lý do từ chối báo cáo</h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg mb-4 h-32 focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Nhập chi tiết lý do từ chối..."
            />
            <div className="flex justify-end space-x-3">
              <button onClick={() => setShowRejectModal(false)} className="py-2 px-4 rounded-lg border border-gray-300 hover:bg-gray-100 text-gray-700 transition duration-150 ease-in-out">Hủy</button>
              <button 
                onClick={handleReject} 
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-150 ease-in-out"
                disabled={loading}
              >
                {loading ? 'Đang xử lý...' : 'Xác nhận từ chối'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showRevisionModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="bg-white p-6 md:p-8 rounded-lg shadow-xl w-full max-w-md mx-4">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Lý do yêu cầu chỉnh sửa</h3>
            <textarea
              value={revisionReason}
              onChange={(e) => setRevisionReason(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg mb-4 h-32 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              placeholder="Nhập nội dung cần chỉnh sửa/bổ sung..."
            />
            <div className="flex justify-end space-x-3">
              <button onClick={() => setShowRevisionModal(false)} className="py-2 px-4 rounded-lg border border-gray-300 hover:bg-gray-100 text-gray-700 transition duration-150 ease-in-out">Hủy</button>
              <button 
                onClick={handleRequestRevision} 
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 px-4 rounded-lg transition duration-150 ease-in-out"
                disabled={loading}
              >
                {loading ? 'Đang xử lý...' : 'Gửi yêu cầu'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventReportDetail; 