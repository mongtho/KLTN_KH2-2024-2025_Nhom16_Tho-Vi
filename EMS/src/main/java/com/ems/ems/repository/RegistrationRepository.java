package com.ems.ems.repository;

import com.ems.ems.model.Event;
import com.ems.ems.model.Registration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface RegistrationRepository extends JpaRepository<Registration, Long> {
    
    // Find registrations for a specific event
    List<Registration> findByEvent(Event event);
    
    // Find registrations for a specific event ID
    List<Registration> findByEventId(Long eventId);
    
    // Find registrations by a specific user
    List<Registration> findByUserId(String userId);
    
    // Find registrations by event and user
    Optional<Registration> findByEventIdAndUserId(Long eventId, String userId);
    
    // Check if a user is registered for an event
    boolean existsByEventIdAndUserId(Long eventId, String userId);
    
    // Check if a user has an active registration for an event
    boolean existsByEventIdAndUserIdAndStatus(Long eventId, String userId, String status);
    
    // Count registrations for an event
    long countByEventId(Long eventId);
    
    // Count active registrations for an event
    long countByEventIdAndStatus(Long eventId, String status);
    
    // Find registrations by status
    List<Registration> findByStatus(String status);
    
    // Find registrations by event ID and status
    List<Registration> findByEventIdAndStatus(Long eventId, String status);

    long countByStatus(String status);

    @Query("SELECT CAST(r.registrationDate AS date) as regDate, COUNT(r) FROM Registration r WHERE r.registrationDate >= :startDate GROUP BY regDate ORDER BY regDate ASC")
    List<Object[]> countRegistrationsByDateSince(@Param("startDate") LocalDateTime startDate);

    // New method to find a registration by its ID and event ID
    Optional<Registration> findByIdAndEventId(Long id, Long eventId);
} 