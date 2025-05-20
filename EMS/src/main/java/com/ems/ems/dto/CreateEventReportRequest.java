package com.ems.ems.dto;

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
public class CreateEventReportRequest {
    private Long eventId;
    private LocalDate date;
    private String location;
    private Integer attendees;
    private String summary;
    private String outcomes;
    private String challenges;
    private String recommendations;
    private List<String> attachments;
    private String submittedBy;
} 