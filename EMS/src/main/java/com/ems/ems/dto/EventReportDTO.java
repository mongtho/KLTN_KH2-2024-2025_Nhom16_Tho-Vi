package com.ems.ems.dto;

import com.ems.ems.model.EventReportStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventReportDTO {
    private Long id;
    private Long eventId;
    private String eventName;
    private String organizer;
    private String department;
    private LocalDate date;
    private String location;
    private Integer attendees;
    private String summary;
    private String outcomes;
    private String challenges;
    private String recommendations;
    private List<String> attachments;
    private EventReportStatus status;
    private String submittedBy;
    private LocalDateTime submittedAt;
    private String approvedBy;
    private LocalDateTime approvedAt;
    private String rejectedBy;
    private LocalDateTime rejectedAt;
    private String rejectionReason;

    // ---- New fields for revision request ----
    private String revisionRequestedBy;
    private LocalDateTime revisionRequestedAt;
    private String revisionRequestReason;
} 