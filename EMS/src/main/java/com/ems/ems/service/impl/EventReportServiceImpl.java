package com.ems.ems.service.impl;

import com.ems.ems.dto.CreateEventReportRequest;
import com.ems.ems.dto.EventReportDTO;
import com.ems.ems.exception.ResourceNotFoundException;
import com.ems.ems.model.Event;
import com.ems.ems.model.EventReport;
import com.ems.ems.model.EventReportStatus;
import com.ems.ems.model.User;
import com.ems.ems.repository.EventReportRepository;
import com.ems.ems.repository.EventRepository;
import com.ems.ems.service.EventReportService;
import com.ems.ems.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class EventReportServiceImpl implements EventReportService {

    private final EventReportRepository eventReportRepository;
    private final EventRepository eventRepository;
    private final UserService userService;

    @Override
    public EventReportDTO createEventReport(CreateEventReportRequest request) {
        User submitter = userService.findByUsername(request.getSubmittedBy())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + request.getSubmittedBy()));

        Event event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));

        EventReport eventReport = new EventReport();
        eventReport.setEventId(event.getId().toString());
        eventReport.setEventName(event.getTitle());
        eventReport.setOrganizer(event.getOrganizer());
        eventReport.setDate(request.getDate());
        eventReport.setLocation(request.getLocation());
        eventReport.setAttendees(request.getAttendees());
        eventReport.setSummary(request.getSummary());
        eventReport.setOutcomes(request.getOutcomes());
        eventReport.setChallenges(request.getChallenges());
        eventReport.setRecommendations(request.getRecommendations());
        eventReport.setAttachments(request.getAttachments());
        eventReport.setStatus(EventReportStatus.PENDING);
        eventReport.setSubmittedBy(submitter);
        eventReport.setSubmittedDate(LocalDateTime.now());

        // Clear any previous revision/rejection fields for new reports
        eventReport.setRevisionRequestedBy(null);
        eventReport.setRevisionRequestedDate(null);
        eventReport.setRevisionRequestReason(null);
        eventReport.setRejectedBy(null);
        eventReport.setRejectedDate(null);
        eventReport.setRejectReason(null);

        EventReport savedReport = eventReportRepository.save(eventReport);
        return convertToDTO(savedReport);
    }

    @Override
    public List<EventReportDTO> getAllEventReports() {
        return eventReportRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public EventReportDTO getEventReportById(Long id) {
        EventReport report = eventReportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event Report not found"));
        return convertToDTO(report);
    }

    @Override
    public EventReportDTO updateEventReport(Long id, CreateEventReportRequest request) {
        EventReport report = eventReportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event Report not found"));

        report.setDate(request.getDate());
        report.setLocation(request.getLocation());
        report.setAttendees(request.getAttendees());
        report.setSummary(request.getSummary());
        report.setOutcomes(request.getOutcomes());
        report.setChallenges(request.getChallenges());
        report.setRecommendations(request.getRecommendations());
        report.setAttachments(request.getAttachments());

        // If the report was previously REJECTED or had a revision requested,
        // and is now being updated, it should go back to PENDING.
        if (report.getStatus() == EventReportStatus.REJECTED || report.getRevisionRequestReason() != null) {
            report.setStatus(EventReportStatus.PENDING);
            // Clear rejection/revision fields as it's a new submission cycle
            report.setRejectedBy(null);
            report.setRejectedDate(null);
            report.setRejectReason(null);
            report.setRevisionRequestedBy(null);
            report.setRevisionRequestedDate(null);
            report.setRevisionRequestReason(null);
            // Also clear approval fields
            report.setApprovedBy(null);
            report.setApprovedDate(null);
        }

        EventReport updatedReport = eventReportRepository.save(report);
        return convertToDTO(updatedReport);
    }

    @Override
    public void deleteEventReport(Long id) {
        if (!eventReportRepository.existsById(id)) {
            throw new ResourceNotFoundException("Event Report not found");
        }
        eventReportRepository.deleteById(id);
    }

    @Override
    public EventReportDTO updateEventReportStatus(Long id, EventReportStatus status, Long userId) {
        EventReport report = eventReportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event Report not found"));
        
        User actionUser = userService.getUserById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
        
        report.setStatus(status);
        
        if (status == EventReportStatus.APPROVED) {
            report.setApprovedBy(actionUser);
            report.setApprovedDate(LocalDateTime.now());
            // Clear any previous rejection/revision fields if it's now approved
            report.setRejectedBy(null);
            report.setRejectedDate(null);
            report.setRejectReason(null);
            report.setRevisionRequestedBy(null);
            report.setRevisionRequestedDate(null);
            report.setRevisionRequestReason(null);
        } else if (status == EventReportStatus.REJECTED) {
            // This path is primarily handled by rejectEventReport method which includes reason.
            // If status is set to REJECTED here directly, ensure consistency.
            report.setApprovedBy(null);
            report.setApprovedDate(null);
            report.setRevisionRequestedBy(null);
            report.setRevisionRequestedDate(null);
            report.setRevisionRequestReason(null);
            // Note: rejectReason and rejectedBy should be set by rejectEventReport
        } else if (status == EventReportStatus.PENDING) {
            // If explicitly set to PENDING (e.g., admin reopens a report or after revision request)
            // Clear all approval/rejection/revision fields to signify a fresh review cycle,
            // unless it's coming from a revision request (handled in requestRevisionForApprovedReport).
            // The general updateEventReport method handles clearing when a user submits an update after rejection/revision.
            // This branch handles direct admin action to set to PENDING.
             if (report.getRevisionRequestReason() == null) { // only clear if not part of a revision flow already
                report.setApprovedBy(null);
                report.setApprovedDate(null);
                report.setRejectedBy(null);
                report.setRejectedDate(null);
                report.setRejectReason(null);
            }
             // Revision fields are managed by requestRevision and updateEventReport
        }

        EventReport updatedReport = eventReportRepository.save(report);
        return convertToDTO(updatedReport);
    }

    @Override
    public EventReportDTO rejectEventReport(Long id, String reason, Long userId) {
        EventReport report = eventReportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event Report not found"));
        
        User rejecter = userService.getUserById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
        
        report.setStatus(EventReportStatus.REJECTED);
        report.setRejectedBy(rejecter);
        report.setRejectedDate(LocalDateTime.now());
        report.setRejectReason(reason);

        // Clear approval and revision fields upon rejection
        report.setApprovedBy(null);
        report.setApprovedDate(null);
        report.setRevisionRequestedBy(null);
        report.setRevisionRequestedDate(null);
        report.setRevisionRequestReason(null);

        EventReport updatedReport = eventReportRepository.save(report);
        return convertToDTO(updatedReport);
    }

    @Override
    public List<EventReportDTO> getEventReportsByEventId(String eventId) {
        return eventReportRepository.findByEventId(eventId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public EventReportDTO requestRevisionForApprovedReport(Long reportId, String reason, Long adminUserId) {
        EventReport report = eventReportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Event Report not found with ID: " + reportId));

        if (report.getStatus() != EventReportStatus.APPROVED) {
            throw new IllegalStateException("Report must be in APPROVED status to request revision. Current status: " + report.getStatus());
        }

        User adminUser = userService.getUserById(adminUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin user not found with ID: " + adminUserId));

        report.setStatus(EventReportStatus.PENDING); // Send back to PENDING for user to update
        report.setRevisionRequestedBy(adminUser);
        report.setRevisionRequestedDate(LocalDateTime.now());
        report.setRevisionRequestReason(reason);

        // Keep approvedBy/Date for history of original approval.
        // User update will clear these if they resubmit.

        EventReport updatedReport = eventReportRepository.save(report);
        return convertToDTO(updatedReport);
    }

    private EventReportDTO convertToDTO(EventReport report) {
        return EventReportDTO.builder()
                .id(report.getId())
                .eventId(Long.parseLong(report.getEventId()))
                .eventName(report.getEventName())
                .organizer(report.getOrganizer())
                .date(report.getDate())
                .location(report.getLocation())
                .attendees(report.getAttendees())
                .summary(report.getSummary())
                .outcomes(report.getOutcomes())
                .challenges(report.getChallenges())
                .recommendations(report.getRecommendations())
                .attachments(report.getAttachments())
                .status(report.getStatus())
                .submittedBy(report.getSubmittedBy().getUsername())
                .submittedAt(report.getSubmittedDate())
                .approvedBy(report.getApprovedBy() != null ? report.getApprovedBy().getUsername() : null)
                .approvedAt(report.getApprovedDate())
                .rejectedBy(report.getRejectedBy() != null ? report.getRejectedBy().getUsername() : null)
                .rejectedAt(report.getRejectedDate())
                .rejectionReason(report.getRejectReason())
                // Add new fields to DTO conversion
                .revisionRequestedBy(report.getRevisionRequestedBy() != null ? report.getRevisionRequestedBy().getUsername() : null)
                .revisionRequestedAt(report.getRevisionRequestedDate())
                .revisionRequestReason(report.getRevisionRequestReason())
                .build();
    }
} 