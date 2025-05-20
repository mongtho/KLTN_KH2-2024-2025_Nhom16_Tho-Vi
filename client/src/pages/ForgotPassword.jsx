import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import authService from '../services/auth.service';
import { toast } from 'react-toastify';
import { FaEnvelope, FaPaperPlane } from 'react-icons/fa';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(''); // For success/error messages
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setEmail(e.target.value);
    setError(''); // Clear error on change
    setMessage(''); // Clear message on change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!email) {
      setError('Vui lòng nhập địa chỉ email của bạn.');
      return;
    }
    // Basic email format validation
    if (!/\S+@\S+\.\S+/.test(email)) {
        setError('Địa chỉ email không hợp lệ.');
        return;
    }

    setLoading(true);
    try {
      // Pass email in the expected object format for the service function
      await authService.forgotPassword({ email: email });
      setMessage('Yêu cầu đặt lại mật khẩu đã được gửi. Nếu email của bạn tồn tại trong hệ thống, bạn sẽ nhận được một email với mật khẩu tạm thời. Vui lòng kiểm tra hộp thư đến (và cả thư mục spam).');
      toast.success('Yêu cầu đã được gửi thành công!');
      setEmail(''); // Clear input on success
    } catch (err) {
      console.error('Forgot password submission error:', err);
      const errorMessage = err.message || 'Đã xảy ra lỗi. Vui lòng thử lại.';
      setError(errorMessage);
      toast.error(`Lỗi: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
         <div className="flex justify-center mb-6">
           {/* You can reuse the logo component from Login if you have one */}
           <svg className="h-12 w-auto text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
           </svg>
         </div>
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          Quên mật khẩu?
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Nhập địa chỉ email của bạn để nhận mật khẩu tạm thời.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Địa chỉ Email
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                   <FaEnvelope className="h-5 w-5 text-gray-400" />
                 </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={handleChange}
                  className={`appearance-none block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                    error ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="you@example.com"
                  disabled={loading}
                />
              </div>
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
              {message && <p className="mt-2 text-sm text-green-600">{message}</p>}
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? (
                   <>
                     <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                     </svg>
                     Đang gửi...
                   </>
                ) : (
                  <>
                    <FaPaperPlane className="-ml-1 mr-2 h-4 w-4" />
                    Gửi yêu cầu
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Hoặc</span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Quay lại Đăng nhập
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword; 