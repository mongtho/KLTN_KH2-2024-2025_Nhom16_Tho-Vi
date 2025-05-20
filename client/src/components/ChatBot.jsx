import React, { useState, useEffect, useRef } from 'react';
import chatService from '../services/chatService';
import { FaRobot, FaUser, FaTimes, FaCommentDots } from 'react-icons/fa';
import { IoMdSend } from 'react-icons/io';
import eventService from '../services/eventService';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Xin chào! Tôi có thể giúp bạn tìm hiểu về các sự kiện. Bạn có thể hỏi về:\n- Thông tin chung (tên, mô tả, thời gian, địa điểm)\n- Đơn vị tổ chức và diễn giả\n- Đối tượng tham gia\n- Kế hoạch di chuyển và phương tiện\n- Trạng thái và số lượng đăng ký' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [events, setEvents] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventData = await eventService.getAllEvents();
        console.log(eventData);
        setEvents(eventData);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu sự kiện:", error);
      }
    };
    
    if (isOpen) {
      fetchEvents();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };


  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const userMessage = { role: 'user', content: input };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);
    
    try {


      // Gửi câu hỏi và danh sách sự kiện liên quan đến ChatGPT
      const response = await chatService.sendMessage(currentInput, events);
      
      setMessages(prevMessages => [
        ...prevMessages,
        { role: 'assistant', content: response }
      ]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prevMessages => [
        ...prevMessages,
        { role: 'assistant', content: 'Xin lỗi, tôi gặp lỗi khi xử lý yêu cầu của bạn. Vui lòng thử lại sau.' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="fixed bottom-5 right-5 z-[1000] font-sans">
      {isOpen ? (
        <div className="w-80 sm:w-96 h-[500px] bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 transition-all duration-300 ease-out">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex justify-between items-center shadow-md">
            <div className="flex items-center space-x-2">
              <FaRobot className="text-xl" />
              <h3 className="font-bold text-lg">Trợ lý Sự kiện</h3>
            </div>
            <button
              onClick={toggleChatbot}
              className="text-white hover:text-gray-200 p-1 rounded-full hover:bg-white/20 transition-colors"
              aria-label="Đóng chat"
            >
              <FaTimes size={18} />
            </button>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-white/80 scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-gray-100">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && <FaRobot className="text-blue-600 text-xl mb-1 flex-shrink-0" />}
                <div className={`max-w-[80%] px-4 py-2 rounded-xl shadow-sm ${ 
                  msg.role === 'user'
                    ? 'bg-blue-500 text-white rounded-br-none'
                    : 'bg-gray-100 text-gray-800 rounded-bl-none border border-gray-200'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
                {msg.role === 'user' && <FaUser className="text-gray-400 text-lg mb-1 flex-shrink-0" />}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-end gap-2 justify-start">
                 <FaRobot className="text-blue-600 text-xl mb-1 flex-shrink-0" />
                 <div className="max-w-[80%] px-4 py-2 rounded-xl shadow-sm bg-gray-100 text-gray-800 rounded-bl-none border border-gray-200">
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-75"></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-150"></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-300"></div>
                    </div>
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-3 bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="flex items-center bg-white rounded-full border border-gray-300 shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Hỏi về sự kiện..."
                className="flex-1 px-4 py-2 border-none rounded-l-full focus:outline-none text-sm bg-transparent"
                disabled={isLoading}
              />
              <button
                type="submit"
                className="bg-blue-600 text-white p-2 rounded-full m-1 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                disabled={isLoading || !input.trim()}
                aria-label="Gửi tin nhắn"
              >
                <IoMdSend size={18} />
              </button>
            </div>
          </form>
        </div>
      ) : (
        <button
          onClick={toggleChatbot}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white p-4 rounded-full shadow-lg flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105"
          aria-label="Mở chat"
        >
          <FaCommentDots className="text-2xl" />
        </button>
      )}
    </div>
  );
};

export default ChatBot; 