// ChatGPT API Service
const API_KEY = "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"; // Thay bằng API key thực tế của bạn
const API_URL = "https://api.openai.com/v1/chat/completions";

const chatService = {
  sendMessage: async (message, events = []) => {
    try {
      // Chuẩn bị system prompt với thông tin chi tiết về cấu trúc sự kiện
      let systemPrompt = `Bạn là trợ lý thông minh cho hệ thống quản lý sự kiện giáo dục. 
Mỗi sự kiện có các thông tin sau:
- title: Tên sự kiện
- description: Mô tả
- location: Địa điểm
- startDate và endDate: Thời gian bắt đầu và kết thúc
- organizer: Đơn vị tổ chức
- capacity: Sức chứa
- registrations: Số người đã đăng ký
- speaker: Diễn giả
- targetAudience: Đối tượng tham gia
- travelPlan: Kế hoạch di chuyển
- transportation: Phương tiện di chuyển
- status: Trạng thái (PENDING: Chờ duyệt, APPROVED: Đã duyệt, REJECTED: Từ chối, CANCELLED: Đã hủy)

Hãy trả lời các câu hỏi về sự kiện một cách ngắn gọn, đầy đủ và thân thiện.`;

      // Thêm thông tin về các sự kiện hiện có
      if (events.length > 0) {
        systemPrompt += "\n\nDanh sách sự kiện hiện có:";
        events.forEach(event => {
          systemPrompt += `\n
Sự kiện: ${event.title}
Thời gian: ${new Date(event.startDate).toLocaleString('vi-VN')} - ${new Date(event.endDate).toLocaleString('vi-VN')}
Địa điểm: ${event.location}
Đơn vị tổ chức: ${event.organizer}
Sức chứa: ${event.capacity} người
${event.registrations ? `Đã đăng ký: ${event.registrations} người` : ''}
Diễn giả: ${event.speaker || 'Chưa cập nhật'}
Đối tượng: ${event.targetAudience || 'Tất cả'}
${event.travelPlan ? `Kế hoạch di chuyển: ${event.travelPlan}` : ''}
${event.transportation ? `Phương tiện: ${event.transportation}` : ''}
Trạng thái: ${event.status === 'PENDING' ? 'Chờ duyệt' : 
              event.status === 'APPROVED' ? 'Đã duyệt' : 
              event.status === 'REJECTED' ? 'Từ chối' : 
              event.status === 'CANCELLED' ? 'Đã hủy' : event.status}`;
        });
      }

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message }
          ],
          max_tokens: 500, // Tăng độ dài câu trả lời
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Lỗi kết nối với API ChatGPT");
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error("Lỗi gọi ChatGPT API:", error);
      return "Xin lỗi, tôi không thể trả lời lúc này. Vui lòng thử lại sau.";
    }
  }
};

export default chatService; 