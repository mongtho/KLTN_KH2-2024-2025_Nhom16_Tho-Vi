package com.ems.ems.controller;

import com.ems.ems.dto.CreateEventReportRequest;
import com.ems.ems.dto.EventReportDTO;
import com.ems.ems.model.EventReport;
import com.ems.ems.model.EventReportStatus;
import com.ems.ems.service.EventReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/event-reports")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class EventReportController {

    private final EventReportService eventReportService;

    @PostMapping
    public ResponseEntity<EventReportDTO> createEventReport(@RequestBody CreateEventReportRequest request) {
        log.info("Received request to create event report: {}", request);
        try {
            EventReportDTO result = eventReportService.createEventReport(request);
            log.info("Successfully created event report with ID: {}", result.getId());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error creating event report: ", e);
            throw e;
        }
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF', 'USER')")
    public ResponseEntity<List<EventReportDTO>> getAllEventReports() {
        return ResponseEntity.ok(eventReportService.getAllEventReports());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventReportDTO> getEventReportById(@PathVariable Long id) {
        return ResponseEntity.ok(eventReportService.getEventReportById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EventReportDTO> updateEventReport(
            @PathVariable Long id,
            @RequestBody CreateEventReportRequest request) {
        return ResponseEntity.ok(eventReportService.updateEventReport(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEventReport(@PathVariable Long id) {
        eventReportService.deleteEventReport(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<EventReportDTO> approveEventReport(
            @PathVariable Long id,
            @RequestParam Long userId) {
        return ResponseEntity.ok(eventReportService.updateEventReportStatus(id, EventReportStatus.APPROVED, userId));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<EventReportDTO> rejectEventReport(
            @PathVariable Long id,
            @RequestParam String reason,
            @RequestParam Long userId) {
        return ResponseEntity.ok(eventReportService.rejectEventReport(id, reason, userId));
    }

    @GetMapping("/event/{eventId}")
    public ResponseEntity<List<EventReportDTO>> getEventReportsByEventId(@PathVariable String eventId) {
        return ResponseEntity.ok(eventReportService.getEventReportsByEventId(eventId));
    }

    @PostMapping("/{id}/request-revision")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<EventReportDTO> requestRevision(
            @PathVariable Long id,
            @RequestParam String reason,
            @RequestParam Long userId
    ) {
        log.info("Received request to ask for revision for report ID: {}, reason: {}, by user ID: {}", id, reason, userId);
        try {
            EventReportDTO result = eventReportService.requestRevisionForApprovedReport(id, reason, userId);
            log.info("Successfully requested revision for report ID: {}", result.getId());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error requesting revision for report ID: {}: ", id, e);
            throw e;
        }
    }
} 