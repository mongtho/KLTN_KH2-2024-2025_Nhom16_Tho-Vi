package com.ems.ems.controller;

import com.ems.ems.dto.ContactRequest;
import com.ems.ems.dto.LoginRequest;
import com.ems.ems.model.User;
import com.ems.ems.response.LoginResponse;
import com.ems.ems.service.AuthService;
import com.ems.ems.util.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.apache.commons.mail.EmailException;
import org.apache.commons.mail.HtmlEmail;

import java.security.SecureRandom;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    private AuthService authService;

    @Autowired
    private JwtUtil jwtUtil;


    private static final String mailHost = "smtp-relay.brevo.com";
    private static final int mailPort = 587;
    private static final String mailUsername = "h5studiogl@gmail.com";
    private static final String mailPassword = "fScdnZ4WmEDqjBA1";

    @PostMapping("/register")
    public ResponseEntity<User> register(@RequestBody User user) {
        return ResponseEntity.ok(authService.register(user));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest loginRequest) {
        Optional<User> user = authService.login(loginRequest.getUsername(), loginRequest.getPassword());
        return user.map(u -> {
            String token = jwtUtil.createToken(u.getUsername());
            return ResponseEntity.ok(new LoginResponse(token, u));
        }).orElseGet(() -> ResponseEntity.status(401).build());
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(@RequestParam String username, @RequestParam String newPassword) {
        authService.resetPassword(username, newPassword);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        // Logic for logout (e.g., invalidate session or token)
        return ResponseEntity.ok().build();
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Void> forgotPassword(@RequestParam String email) {
        Optional<User> userOptional = authService.findByEmail(email);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            String temporaryPassword = generateRandomPassword();
            try {
                // Update password in the database
                authService.updatePassword(user.getUsername(), temporaryPassword);
                // Send the temporary password via email
                sendTemporaryPasswordEmail(email, temporaryPassword);
                return ResponseEntity.ok().build();
            } catch (Exception e) {
                logger.error("Error during password reset process for {}: ", email, e);
                // Potentially return a specific error response if password update or email sending fails
                return ResponseEntity.status(500).build(); 
            }
        } else {
            logger.warn("Forgot password attempt for non-existent email: {}", email);
            return ResponseEntity.status(404).build(); // User not found
        }
    }

    @PostMapping("/update-user/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User userDetails) {
        User updatedUser = authService.updateUser(id, userDetails);
        return ResponseEntity.ok(updatedUser);
    }

    @PostMapping("/contact")
    public ResponseEntity<Void> handleContactForm(@RequestBody ContactRequest contactRequest) {
        logger.info("Received contact form submission from: {} ({})", contactRequest.getName(), contactRequest.getEmail());
        try {
            sendContactEmailToAdmins(contactRequest);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("Failed to send contact form email", e);
            return ResponseEntity.status(500).build(); // Internal server error
        }
    }

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    // Helper method to generate a random password
    private String generateRandomPassword() {
        final String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        final int length = 10; // Password length
        SecureRandom random = new SecureRandom();
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }

    // Renamed and modified method to send temporary password
    private void sendTemporaryPasswordEmail(String email, String temporaryPassword) {
        String subject = "Mật khẩu tạm thời của bạn";
        String content = "<p>Xin chào,</p>"
                + "<p>Bạn đã yêu cầu đặt lại mật khẩu của mình.</p>"
                + "<p>Mật khẩu tạm thời của bạn là: <strong>" + temporaryPassword + "</strong></p>"
                + "<p>Vui lòng đăng nhập bằng mật khẩu tạm thời này và thay đổi mật khẩu của bạn ngay lập tức trong phần cài đặt tài khoản.</p>"
                + "<p>Nếu bạn không yêu cầu điều này, vui lòng bỏ qua email này hoặc liên hệ với bộ phận hỗ trợ.</p>";

        try {
            HtmlEmail htmlEmail = new HtmlEmail();
            htmlEmail.setHostName(mailHost);
            htmlEmail.setSmtpPort(mailPort);
            htmlEmail.setStartTLSEnabled(true);
            htmlEmail.setAuthentication(mailUsername, mailPassword);
            htmlEmail.setFrom(mailUsername);
            htmlEmail.setSubject(subject);
            htmlEmail.setHtmlMsg(content);
            htmlEmail.addTo(email);
            
            htmlEmail.setCharset("UTF-8");

            htmlEmail.send();
            logger.info("Email mật khẩu tạm thời đã được gửi thành công đến {}", email);
        } catch (EmailException e) {
            logger.error("Lỗi khi gửi email mật khẩu tạm thời: ", e);
            // Consider re-throwing or handling this exception more specifically if needed
            // for the calling method to know email sending failed.
        }
    }

    private void sendContactEmailToAdmins(ContactRequest contactRequest) throws EmailException {
        String adminEmail1 = "vovanhung77h12@gmail.com";
        String adminEmail2 = "mongthodang07032002@gmail.com";
        
        // Translate subject to Vietnamese
        String subject = "[Liên Hệ EduEvent] Tin nhắn mới: " + contactRequest.getSubject(); 
        // Translate content to Vietnamese
        String content = "<h2>Có tin nhắn liên hệ mới từ website</h2>"
                + "<p><strong>Tên người gửi:</strong> " + escapeHtml(contactRequest.getName()) + "</p>"
                + "<p><strong>Email người gửi:</strong> " + escapeHtml(contactRequest.getEmail()) + "</p>"
                + "<p><strong>Chủ đề:</strong> " + escapeHtml(contactRequest.getSubject()) + "</p>"
                + "<p><strong>Nội dung tin nhắn:</strong></p>"
                + "<pre style=\"white-space: pre-wrap; background-color: #f5f5f5; padding: 10px; border: 1px solid #ddd;\">"
                + escapeHtml(contactRequest.getMessage()) + "</pre>";

        HtmlEmail htmlEmail = new HtmlEmail();
        htmlEmail.setHostName(mailHost);
        htmlEmail.setSmtpPort(mailPort);
        htmlEmail.setStartTLSEnabled(true);
        htmlEmail.setAuthentication(mailUsername, mailPassword);
        // Update sender name to Vietnamese
        htmlEmail.setFrom(mailUsername, "EduEventManager - Liên hệ"); 
        htmlEmail.setSubject(subject);
        htmlEmail.setHtmlMsg(content);
        htmlEmail.addTo(adminEmail1);
        htmlEmail.addTo(adminEmail2);
        htmlEmail.setCharset("UTF-8");

        htmlEmail.send();
        // Update log message to Vietnamese
        logger.info("Email liên hệ đã được gửi thành công đến quản trị viên từ {}", contactRequest.getEmail());
    }

    private String escapeHtml(String text) {
        if (text == null) return "";
        return text.replace("&", "&amp;")
                   .replace("<", "&lt;")
                   .replace(">", "&gt;")
                   .replace("\"", "&quot;")
                   .replace("'", "&#39;");
    }
}

