package com.ems.ems.service;

import com.ems.ems.dto.CreateEventReportRequest;
import com.ems.ems.dto.EventReportDTO;
import com.ems.ems.model.EventReportStatus;

import java.util.List;

public interface EventReportService {
    EventReportDTO createEventReport(CreateEventReportRequest request);
    List<EventReportDTO> getAllEventReports();
    EventReportDTO getEventReportById(Long id);
    EventReportDTO updateEventReport(Long id, CreateEventReportRequest request);
    void deleteEventReport(Long id);
    EventReportDTO updateEventReportStatus(Long id, EventReportStatus status, Long userId);
    EventReportDTO rejectEventReport(Long id, String reason, Long userId);
    List<EventReportDTO> getEventReportsByEventId(String eventId);
    EventReportDTO requestRevisionForApprovedReport(Long reportId, String reason, Long adminUserId);
} 