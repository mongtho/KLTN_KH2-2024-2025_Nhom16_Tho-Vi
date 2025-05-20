package com.ems.ems.repository;

import com.ems.ems.model.Event;
import com.ems.ems.model.EventStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {

    // Find events by status
    List<Event> findByStatus(EventStatus status);

    // Find events created by a specific user
    List<Event> findByCreatedBy(String createdByEmail);

    // Find events by status and created by a specific user
    List<Event> findByStatusAndCreatedBy(EventStatus status, String createdByEmail);

    // Find events by title containing a search term (case-insensitive)
    List<Event> findByTitleContainingIgnoreCase(String title);

    // Combine search and status filtering
    List<Event> findByStatusAndTitleContainingIgnoreCase(EventStatus status, String title);

    // Combine search and creator filtering
    List<Event> findByCreatedByAndTitleContainingIgnoreCase(String createdByEmail, String title);

    // Combine search, status, and creator filtering
    List<Event> findByStatusAndCreatedByAndTitleContainingIgnoreCase(EventStatus status, String createdByEmail, String title);

    long countByStatus(EventStatus status);

    long countByStartDateAfter(LocalDateTime date);

    @Query("SELECT status, COUNT(e) FROM Event e GROUP BY e.status")
    List<Object[]> countEventsByStatus();

} 