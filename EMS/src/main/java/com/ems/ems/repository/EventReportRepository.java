package com.ems.ems.repository;

import com.ems.ems.model.EventReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventReportRepository extends JpaRepository<EventReport, Long> {
    List<EventReport> findByEventId(String eventId);
} 