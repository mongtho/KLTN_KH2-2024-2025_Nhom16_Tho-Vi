package com.ems.ems.controller;

import com.ems.ems.dto.EventDTO;
import com.ems.ems.model.Event;
import com.ems.ems.model.EventStatus;
import com.ems.ems.model.Registration;
import com.ems.ems.model.User;
import com.ems.ems.response.SimpleMessageResponse;
import com.ems.ems.dto.UserRegistrationDTO;
import com.ems.ems.repository.UserRepository;
import com.ems.ems.service.AuthService;
import com.ems.ems.service.EventService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import org.apache.commons.mail.EmailException;
import org.apache.commons.mail.HtmlEmail;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = "*")
public class EventController {

    @Autowired
    private EventService eventService;

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    private static final String mailHost = "smtp-relay.brevo.com";
    private static final int mailPort = 587;
    private static final String mailUsername = "h5studiogl@gmail.com";
    private static final String mailPassword = "fScdnZ4WmEDqjBA1";
    private static final Logger logger = LoggerFactory.getLogger(EventController.class);

    private String getUserRole(UserDetails userDetails) {
        if (userDetails == null || userDetails.getAuthorities() == null || userDetails.getAuthorities().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User role information is missing");
        }
        return userDetails.getAuthorities().iterator().next().getAuthority();
    }

    @GetMapping
    public ResponseEntity<List<Event>> getEvents(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String role) {

        String userEmail = userId != null ? userId.toString() : null;
        List<Event> events = eventService.findEvents(userEmail, role, status, search);
        return ResponseEntity.ok(events);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Event> getEventById(@PathVariable Long id) {
        return eventService.getEventById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createEvent(@Valid @RequestBody EventDTO eventDTO) {
        Long userId = eventDTO.getUserId();
        if (userId == null) {
             return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("User ID is missing in the request.");
        }

        try {
            Event createdEvent = eventService.createEvent(eventDTO, userId.toString());
            // Send notification email to non-USER roles
            try {
                List<User> usersToNotify = userRepository.findAll().stream()
                        .filter(user -> user.getRole() != null && user.getRole() != User.Role.USER)
                        .collect(Collectors.toList());
                for (User user : usersToNotify) {
                    sendEventCreationNotificationEmail(user, createdEvent);
                }
            } catch (Exception mailEx) {
                logger.error("Failed to send event creation notification email for event {}: ", createdEvent.getId(), mailEx);
            }
            return new ResponseEntity<>(createdEvent, HttpStatus.CREATED);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error creating event: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateEvent(@PathVariable Long id,
                                           @Valid @RequestBody EventDTO eventDTO,
                                           @RequestParam(required = false) String role) {
        Long userId = eventDTO.getUserId();
         if (userId == null) {
             return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("User ID is missing in the request.");
         }

        String userRole = role != null ? role : "ROLE_ORGANIZER";
        User actionTaker = authService.getUserById(userId);
        Event oldEventState = eventService.getEventById(id).orElse(null);

        try {
            Event updatedEvent = eventService.updateEvent(id, eventDTO, actionTaker.getEmail(), userRole);

            // Standard update notification for non-USER roles
            try {
                List<User> usersToNotify = userRepository.findAll().stream()
                        .filter(user -> user.getRole() != null && user.getRole() != User.Role.USER)
                        .collect(Collectors.toList());
                for (User user : usersToNotify) {
                    if (!(oldEventState != null && oldEventState.getStatus() == EventStatus.NEEDS_REVISION && updatedEvent.getStatus() == EventStatus.PENDING)) {
                        sendEventUpdateNotificationEmail(user, updatedEvent, actionTaker);
                    }
                }
            } catch (Exception mailEx) {
                logger.error("Failed to send event update notification email for event {}: ", updatedEvent.getId(), mailEx);
            }

            // Specific notification for admins/managers if event was resubmitted
            if (oldEventState != null && oldEventState.getStatus() == EventStatus.NEEDS_REVISION && updatedEvent.getStatus() == EventStatus.PENDING) {
                try {
                    List<User> adminsAndManagers = userRepository.findAll().stream()
                        .filter(user -> user.getRole() == User.Role.ADMIN || user.getRole() == User.Role.MANAGER)
                        .collect(Collectors.toList());
                    for (User adminManager : adminsAndManagers) {
                        sendEventResubmissionNotificationEmail(adminManager, updatedEvent, actionTaker);
                    }
                } catch (Exception mailEx) {
                    logger.error("Failed to send event resubmission notification email for event {}: ", updatedEvent.getId(), mailEx);
                }
            }

            return ResponseEntity.ok(updatedEvent);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error updating event: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEvent(@PathVariable Long id,
                                        @RequestParam Long userId,
                                        @RequestParam String role) {
        try {
            eventService.deleteEvent(id, userId.toString(), role);
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error deleting event: " + e.getMessage());
        }
    }

    @RequestMapping(value = "/{id}/approve", method = {RequestMethod.PATCH, RequestMethod.PUT, RequestMethod.POST})
    public ResponseEntity<?> approveEvent(@PathVariable Long id,
                                        @RequestParam Long userId,
                                        @RequestParam String role) {
        try {
            Event approvedEvent = eventService.approveEvent(id, role);
            // Send notification email to non-USER roles
            try {
                List<User> usersToNotify = userRepository.findAll().stream()
                        .filter(user -> user.getRole() != null && user.getRole() != User.Role.USER)
                        .collect(Collectors.toList());
                User actionTaker = authService.getUserById(userId); // User who approved
                for (User user : usersToNotify) {
                    sendEventApprovalNotificationEmail(user, approvedEvent, actionTaker);
                }
            } catch (Exception mailEx) {
                logger.error("Failed to send event approval notification email for event {}: ", approvedEvent.getId(), mailEx);
            }
            return ResponseEntity.ok(approvedEvent);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error approving event: " + e.getMessage());
        }
    }

    @RequestMapping(value = "/{id}/reject", method = {RequestMethod.PATCH, RequestMethod.PUT, RequestMethod.POST})
    public ResponseEntity<?> rejectEvent(@PathVariable Long id,
                                       @RequestParam Long userId,
                                       @RequestParam String role,
                                       @RequestParam String reason) {
        try {
            Event rejectedEvent = eventService.rejectEvent(id, role, reason);
            // Send notification email to event creator/organizers
            try {
                // Attempt to find the creator by email stored in createdBy field
                User creator = userRepository.findByEmail(rejectedEvent.getCreatedBy()).orElse(null);
                if (creator != null) {
                    sendEventRejectionWithReasonEmail(creator, rejectedEvent, authService.getUserById(userId));
                } else {
                    logger.warn("Could not find creator user with email: {} for event rejection notification.", rejectedEvent.getCreatedBy());
                }
                // Also notify other organizers if they exist and are different from the creator
                if (rejectedEvent.getOrganizers() != null) {
                    for (User organizer : rejectedEvent.getOrganizers()) {
                        if (creator == null || !organizer.getId().equals(creator.getId())) {
                             sendEventRejectionWithReasonEmail(organizer, rejectedEvent, authService.getUserById(userId));
                        }
                    }
                }
            } catch (Exception mailEx) {
                logger.error("Failed to send event rejection with reason notification email for event {}: ", rejectedEvent.getId(), mailEx);
            }
            return ResponseEntity.ok(rejectedEvent);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error rejecting event: " + e.getMessage());
        }
    }
    
    /**
     * Register a user for an event
     */
    @PostMapping("/{id}/register")
    public ResponseEntity<?> registerForEvent(@PathVariable Long id, @RequestParam Long userId) {
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("User ID is required");
        }
        
        try {
            // Check if user is already registered
            boolean isRegistered = eventService.isUserRegisteredForEvent(id, userId.toString());
            if (isRegistered) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("User is already registered for this event");
            }
            
            // Register the user
            Event updatedEvent = eventService.registerForEvent(id, userId.toString());

            // Send confirmation email
            try {
                User user = authService.getUserById(userId);
                sendRegistrationConfirmationEmail(user, updatedEvent);
            } catch (Exception mailEx) {
                // Log email sending failure but don't fail the registration request
                logger.error("Failed to send registration confirmation email to user {} for event {}: ", userId, id, mailEx);
            }

            return ResponseEntity.ok(updatedEvent);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error registering for event: " + e.getMessage());
        }
    }
    
    /**
     * Check if a user is registered for an event
     */
    @GetMapping("/{id}/is-registered")
    public ResponseEntity<?> isRegistered(@PathVariable Long id, @RequestParam Long userId) {
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("User ID is required");
        }
        
        try {
            boolean isRegistered = eventService.isUserRegisteredForEvent(id, userId.toString());
            return ResponseEntity.ok(isRegistered);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error checking registration status: " + e.getMessage());
        }
    }
    
    /**
     * Get all registrations for an event
     */
    @GetMapping("/{id}/registrations")
    public ResponseEntity<?> getEventRegistrations(@PathVariable Long id) {
        try {
            List<Registration> registrations = eventService.getEventRegistrations(id);
            return ResponseEntity.ok(registrations);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error getting event registrations: " + e.getMessage());
        }
    }
    
    /**
     * Cancel a user's registration for an event
     */
    @DeleteMapping("/{id}/register")
    public ResponseEntity<?> cancelRegistration(@PathVariable Long id, @RequestParam Long userId) {
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("User ID is required");
        }
        
        try {
            // Store event details *before* cancelling in case they are needed for the email
            Event event = eventService.getEventById(id)
                   .orElseThrow(() -> new EntityNotFoundException("Event not found: " + id));
            User user = authService.getUserById(userId);
            
            // Cancel the registration (the service might return void or the updated event)
            eventService.cancelRegistration(id, userId.toString());

            // Send cancellation confirmation email
            try {
                sendCancellationConfirmationEmail(user, event);
            } catch (Exception mailEx) {
                // Log email sending failure but don't fail the cancellation request
                logger.error("Failed to send cancellation confirmation email to user {} for event {}: ", userId, id, mailEx);
                // Still return success for the cancellation itself, maybe add info to message?
            }

            // Return success JSON response
            return ResponseEntity.ok(new SimpleMessageResponse("Hủy đăng ký thành công.")); 
        } catch (EntityNotFoundException e) {
             // Return error JSON response
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new SimpleMessageResponse(e.getMessage()));
        } catch (Exception e) {
            logger.error("Error cancelling registration for user {} for event {}: ", userId, id, e);
            // Return generic error JSON response
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new SimpleMessageResponse("Lỗi khi hủy đăng ký: " + e.getMessage())); 
        }
    }

    /**
     * Get list of users registered for an event
     */
    @GetMapping("/{id}/registered-users")
    public ResponseEntity<?> getRegisteredUsers(@PathVariable Long id) {
        try {
            List<UserRegistrationDTO> userRegistrations = eventService.getRegisteredUsersForEvent(id);
            return ResponseEntity.ok(userRegistrations);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Error fetching registered users for event {}: ", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error getting registered users: " + e.getMessage());
        }
    }

    @PutMapping("/{eventId}/registrations/{registrationId}/check-in")
    public ResponseEntity<?> checkInAttendee(@PathVariable Long eventId, @PathVariable Long registrationId) {
        try {
            Registration updatedRegistration = eventService.checkInAttendee(eventId, registrationId);
            return ResponseEntity.ok(updatedRegistration);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            logger.error("Error checking in attendee for registration {} on event {}: ", registrationId, eventId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error checking in attendee: " + e.getMessage());
        }
    }

    // --- Email Sending Methods ---

    private void sendRegistrationConfirmationEmail(User user, Event event) {
        if (user.getEmail() == null) {
            logger.warn("Cannot send registration confirmation: User {} has no email address.", user.getId());
            return;
        }
        String subject = "Xác nhận đăng ký sự kiện thành công: " + event.getTitle();
        String content = String.format("<p>Xin chào %s,</p>"
                + "<p>Bạn đã đăng ký thành công sự kiện sau:</p>"
                + "<p><strong>Sự kiện:</strong> %s</p>"
                + "<p><strong>Thời gian:</strong> %s</p>"
                + "<p><strong>Địa điểm:</strong> %s</p>"
                + "<p>Cảm ơn bạn đã tham gia!</p>"
                + "<p>Trân trọng,<br/>Ban tổ chức EduEventManager</p>",
                escapeHtml(user.getUsername()),
                escapeHtml(event.getTitle()),
                escapeHtml(event.getStartDate().toString()),
                escapeHtml(event.getLocation())
        );

        try {
            HtmlEmail htmlEmail = createHtmlEmail();
            htmlEmail.setSubject(subject);
            htmlEmail.setHtmlMsg(content);
            htmlEmail.addTo(user.getEmail());
            htmlEmail.send();
            logger.info("Registration confirmation email sent successfully to {}", user.getEmail());
        } catch (EmailException e) {
            logger.error("Lỗi khi gửi email xác nhận đăng ký cho {}: ", user.getEmail(), e);
        }
    }

    private void sendCancellationConfirmationEmail(User user, Event event) {
        if (user.getEmail() == null) {
            logger.warn("Cannot send cancellation confirmation: User {} has no email address.", user.getId());
            return;
        }
        String subject = "Xác nhận hủy đăng ký sự kiện: " + event.getTitle();
        String content = String.format("<p>Xin chào %s,</p>"
                + "<p>Yêu cầu hủy đăng ký của bạn cho sự kiện sau đã được xử lý thành công:</p>"
                + "<p><strong>Sự kiện:</strong> %s</p>"
                + "<p><strong>Thời gian:</strong> %s</p>"
                + "<p><strong>Địa điểm:</strong> %s</p>"
                + "<p>Chúng tôi rất tiếc khi bạn không thể tham gia và hy vọng sẽ gặp lại bạn ở các sự kiện khác.</p>"
                + "<p>Trân trọng,<br/>Ban tổ chức EduEventManager</p>",
                escapeHtml(user.getUsername()), // Or use user.getFullName() if available
                escapeHtml(event.getTitle()),
                escapeHtml(event.getStartDate().toString()), // Consider formatting the date
                escapeHtml(event.getLocation())
        );

        try {
            HtmlEmail htmlEmail = createHtmlEmail();
            htmlEmail.setSubject(subject);
            htmlEmail.setHtmlMsg(content);
            htmlEmail.addTo(user.getEmail());
            htmlEmail.send();
            logger.info("Cancellation confirmation email sent successfully to {}", user.getEmail());
        } catch (EmailException e) {
            logger.error("Lỗi khi gửi email xác nhận hủy đăng ký cho {}: ", user.getEmail(), e);
        }
    }

    private HtmlEmail createHtmlEmail() throws EmailException {
        HtmlEmail htmlEmail = new HtmlEmail();
        htmlEmail.setHostName(mailHost);
        htmlEmail.setSmtpPort(mailPort);
        htmlEmail.setStartTLSEnabled(true);
        htmlEmail.setAuthentication(mailUsername, mailPassword);
        htmlEmail.setFrom(mailUsername, "EduEventManager");
        htmlEmail.setCharset("UTF-8");
        return htmlEmail;
    }

    private String escapeHtml(String text) {
        if (text == null) return "";
        return text.replace("&", "&amp;")
                   .replace("<", "&lt;")
                   .replace(">", "&gt;")
                   .replace("\"", "&quot;")
                   .replace("'", "&#39;");
    }

    private void sendEventCreationNotificationEmail(User recipient, Event event) {
        if (recipient.getEmail() == null) {
            logger.warn("Cannot send event creation notification: User {} has no email address.", recipient.getId());
            return;
        }

        String creatorIdentifier;
        try {
            java.util.Optional<User> creatorOpt = userRepository.findByEmail(event.getCreatedBy());
            if (creatorOpt.isPresent()) {
                User creator = creatorOpt.get();
                creatorIdentifier = String.format("%s (ID: %d)", creator.getUsername(), creator.getId());
            } else {
                creatorIdentifier = event.getCreatedBy(); // Fallback to email if user not found
            }
        } catch (Exception e) {
            logger.error("Error fetching creator user by email {}: ", event.getCreatedBy(), e);
            creatorIdentifier = event.getCreatedBy(); // Fallback on error
        }

        String subject = "Thông báo sự kiện mới: " + event.getTitle();
        String content = String.format("<p>Xin chào %s,</p>"
                        + "<p>Một sự kiện mới vừa được tạo trong hệ thống EduEventManager:</p>"
                        + "<p><strong>Sự kiện:</strong> %s</p>"
                        + "<p><strong>Người tạo:</strong> %s</p>"
                        + "<p><strong>Thời gian:</strong> %s</p>"
                        + "<p><strong>Địa điểm:</strong> %s</p>"
                        + "<p>Vui lòng kiểm tra chi tiết sự kiện trong hệ thống.</p>"
                        + "<p>Trân trọng,<br/>Ban quản trị EduEventManager</p>",
                escapeHtml(recipient.getUsername()),
                escapeHtml(event.getTitle()),
                escapeHtml(creatorIdentifier),
                escapeHtml(event.getStartDate().toString()),
                escapeHtml(event.getLocation())
        );

        try {
            HtmlEmail htmlEmail = createHtmlEmail();
            htmlEmail.setSubject(subject);
            htmlEmail.setHtmlMsg(content);
            htmlEmail.addTo(recipient.getEmail());
            htmlEmail.send();
            logger.info("Event creation notification email sent successfully to {} for event {}", recipient.getEmail(), event.getId());
        } catch (EmailException e) {
            logger.error("Lỗi khi gửi email thông báo tạo sự kiện cho {} (sự kiện {}): ", recipient.getEmail(), event.getId(), e);
        }
    }

    private void sendEventUpdateNotificationEmail(User recipient, Event event, User actionTaker) {
        if (recipient.getEmail() == null) {
            logger.warn("Cannot send event update notification: User {} has no email address.", recipient.getId());
            return;
        }
        String subject = "Thông báo cập nhật sự kiện: " + event.getTitle();
        String content = String.format("<p>Xin chào %s,</p>"
                        + "<p>Sự kiện sau vừa được cập nhật trong hệ thống EduEventManager bởi %s (ID: %d):</p>"
                        + "<p><strong>Sự kiện:</strong> %s</p>"
                        + "<p><strong>Thời gian:</strong> %s</p>"
                        + "<p><strong>Địa điểm:</strong> %s</p>"
                        + "<p>Vui lòng kiểm tra chi tiết cập nhật trong hệ thống.</p>"
                        + "<p>Trân trọng,<br/>Ban quản trị EduEventManager</p>",
                escapeHtml(recipient.getUsername()),
                escapeHtml(actionTaker.getUsername()),
                actionTaker.getId(),
                escapeHtml(event.getTitle()),
                escapeHtml(event.getStartDate().toString()),
                escapeHtml(event.getLocation())
        );

        try {
            HtmlEmail htmlEmail = createHtmlEmail();
            htmlEmail.setSubject(subject);
            htmlEmail.setHtmlMsg(content);
            htmlEmail.addTo(recipient.getEmail());
            htmlEmail.send();
            logger.info("Event update notification email sent successfully to {} for event {}", recipient.getEmail(), event.getId());
        } catch (EmailException e) {
            logger.error("Lỗi khi gửi email thông báo cập nhật sự kiện cho {} (sự kiện {}): ", recipient.getEmail(), event.getId(), e);
        }
    }

    private void sendEventApprovalNotificationEmail(User recipient, Event event, User actionTaker) {
        if (recipient.getEmail() == null) {
            logger.warn("Cannot send event approval notification: User {} has no email address.", recipient.getId());
            return;
        }
        String subject = "Thông báo phê duyệt sự kiện: " + event.getTitle();
        String content = String.format("<p>Xin chào %s,</p>"
                        + "<p>Sự kiện sau vừa được phê duyệt trong hệ thống EduEventManager bởi %s (ID: %d):</p>"
                        + "<p><strong>Sự kiện:</strong> %s</p>"
                        + "<p><strong>Trạng thái:</strong> %s</p>"
                        + "<p><strong>Thời gian:</strong> %s</p>"
                        + "<p><strong>Địa điểm:</strong> %s</p>"
                        + "<p>Vui lòng kiểm tra chi tiết trong hệ thống.</p>"
                        + "<p>Trân trọng,<br/>Ban quản trị EduEventManager</p>",
                escapeHtml(recipient.getUsername()),
                escapeHtml(actionTaker.getUsername()),
                actionTaker.getId(),
                escapeHtml(event.getTitle()),
                escapeHtml(event.getStatus().toString()),
                escapeHtml(event.getStartDate().toString()),
                escapeHtml(event.getLocation())
        );

        try {
            HtmlEmail htmlEmail = createHtmlEmail();
            htmlEmail.setSubject(subject);
            htmlEmail.setHtmlMsg(content);
            htmlEmail.addTo(recipient.getEmail());
            htmlEmail.send();
            logger.info("Event approval notification email sent successfully to {} for event {}", recipient.getEmail(), event.getId());
        } catch (EmailException e) {
            logger.error("Lỗi khi gửi email thông báo phê duyệt sự kiện cho {} (sự kiện {}): ", recipient.getEmail(), event.getId(), e);
        }
    }

    private void sendEventRejectionNotificationEmail(User recipient, Event event, User actionTaker) {
        if (recipient.getEmail() == null) {
            logger.warn("Cannot send event rejection notification: User {} has no email address.", recipient.getId());
            return;
        }
        String subject = "Thông báo từ chối sự kiện: " + event.getTitle();
        String content = String.format("<p>Xin chào %s,</p>"
                        + "<p>Sự kiện sau vừa bị từ chối trong hệ thống EduEventManager bởi %s (ID: %d):</p>"
                        + "<p><strong>Sự kiện:</strong> %s</p>"
                        + "<p><strong>Trạng thái:</strong> %s</p>"
                         + "<p><strong>Lý do (nếu có):</strong> Hiện tại hệ thống chưa hỗ trợ nhập lý do từ chối tự động.</p>"
                        + "<p><strong>Thời gian dự kiến:</strong> %s</p>"
                        + "<p><strong>Địa điểm dự kiến:</strong> %s</p>"
                        + "<p>Vui lòng liên hệ quản trị viên để biết thêm chi tiết nếu cần.</p>"
                        + "<p>Trân trọng,<br/>Ban quản trị EduEventManager</p>",
                escapeHtml(recipient.getUsername()),
                escapeHtml(actionTaker.getUsername()),
                actionTaker.getId(),
                escapeHtml(event.getTitle()),
                escapeHtml(event.getStatus().toString()),
                escapeHtml(event.getStartDate().toString()),
                escapeHtml(event.getLocation())
        );

        try {
            HtmlEmail htmlEmail = createHtmlEmail();
            htmlEmail.setSubject(subject);
            htmlEmail.setHtmlMsg(content);
            htmlEmail.addTo(recipient.getEmail());
            htmlEmail.send();
            logger.info("Event rejection notification email sent successfully to {} for event {}", recipient.getEmail(), event.getId());
        } catch (EmailException e) {
            logger.error("Lỗi khi gửi email thông báo từ chối sự kiện cho {} (sự kiện {}): ", recipient.getEmail(), event.getId(), e);
        }
    }

    private void sendEventRejectionWithReasonEmail(User recipient, Event event, User actionTaker) {
        if (recipient == null || recipient.getEmail() == null) {
            logger.warn("Cannot send event rejection with reason notification: Recipient or email is null for event {}.", event.getId());
            return;
        }
        String subject = "Thông báo: Sự kiện cần chỉnh sửa - " + event.getTitle();
        String content = String.format("<p>Xin chào %s,</p>"
                        + "<p>Sự kiện '%s' của bạn đã được xem xét và cần một số điều chỉnh trước khi có thể được phê duyệt.</p>"
                        + "<p><strong>Người xem xét:</strong> %s (ID: %d)</p>"
                        + "<p><strong>Lý do từ chối/Yêu cầu chỉnh sửa:</strong></p>"
                        + "<blockquote style=\"border-left: 4px solid #ccc; padding-left: 10px; margin-left: 5px; color: #555;\">%s</blockquote>"
                        + "<p>Vui lòng truy cập hệ thống quản lý sự kiện, cập nhật thông tin theo yêu cầu và gửi lại để được xem xét.</p>"
                        + "<p>Trân trọng,<br/>Ban quản trị EduEventManager</p>",
                escapeHtml(recipient.getUsername()),
                escapeHtml(event.getTitle()),
                escapeHtml(actionTaker.getUsername()),
                actionTaker.getId(),
                escapeHtml(event.getRejectionReason() != null ? event.getRejectionReason() : "Không có lý do cụ thể.")
        );

        try {
            HtmlEmail htmlEmail = createHtmlEmail();
            htmlEmail.setSubject(subject);
            htmlEmail.setHtmlMsg(content);
            htmlEmail.addTo(recipient.getEmail());
            htmlEmail.send();
            logger.info("Event rejection with reason email sent successfully to {} for event {}", recipient.getEmail(), event.getId());
        } catch (EmailException e) {
            logger.error("Lỗi khi gửi email thông báo từ chối (có lý do) cho {} (sự kiện {}): ", recipient.getEmail(), event.getId(), e);
        }
    }

    private void sendEventResubmissionNotificationEmail(User recipient, Event event, User submittedByUser) {
        if (recipient.getEmail() == null) {
            logger.warn("Cannot send event resubmission notification: User {} has no email address.", recipient.getId());
            return;
        }
        String subject = "Sự kiện đã được cập nhật và đang chờ duyệt lại: " + event.getTitle();
        String content = String.format("<p>Xin chào %s,</p>"
                        + "<p>Sự kiện '%s' đã được cập nhật bởi người dùng %s (ID: %d) sau khi được yêu cầu chỉnh sửa.</p>"
                        + "<p>Sự kiện này hiện đang ở trạng thái '%s' và cần được xem xét lại.</p>"
                        + "<p><strong>Sự kiện:</strong> %s</p>"
                        + "<p><strong>Thời gian:</strong> %s</p>"
                        + "<p><strong>Địa điểm:</strong> %s</p>"
                        + "<p>Vui lòng truy cập hệ thống để xem xét và phê duyệt sự kiện.</p>"
                        + "<p>Trân trọng,<br/>Hệ thống EduEventManager</p>",
                escapeHtml(recipient.getUsername()),
                escapeHtml(event.getTitle()),
                escapeHtml(submittedByUser.getUsername()),
                submittedByUser.getId(),
                escapeHtml(event.getStatus().toString()),
                escapeHtml(event.getTitle()),
                escapeHtml(event.getStartDate().toString()),
                escapeHtml(event.getLocation())
        );

        try {
            HtmlEmail htmlEmail = createHtmlEmail();
            htmlEmail.setSubject(subject);
            htmlEmail.setHtmlMsg(content);
            htmlEmail.addTo(recipient.getEmail());
            htmlEmail.send();
            logger.info("Event resubmission notification email sent successfully to {} for event {}", recipient.getEmail(), event.getId());
        } catch (EmailException e) {
            logger.error("Lỗi khi gửi email thông báo sự kiện gửi lại cho {} (sự kiện {}): ", recipient.getEmail(), event.getId(), e);
        }
    }
} 