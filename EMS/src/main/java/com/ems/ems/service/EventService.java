package com.ems.ems.service;

import com.ems.ems.dto.EventDTO;
import com.ems.ems.dto.UserRegistrationDTO;
import com.ems.ems.model.Event;
import com.ems.ems.model.EventStatus;
import com.ems.ems.model.Registration;
import com.ems.ems.model.User;
import com.ems.ems.repository.EventRepository;
import com.ems.ems.repository.RegistrationRepository;
import com.ems.ems.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;

@Service
public class EventService {

    private static final Logger logger = LoggerFactory.getLogger(EventService.class);

    @Autowired
    private EventRepository eventRepository;
    
    @Autowired
    private RegistrationRepository registrationRepository;
    
    @Autowired
    private UserRepository userRepository;

    // Convert DTO to Entity
    private Event convertToEntity(EventDTO eventDTO) {
        Event event = new Event();
        event.setId(eventDTO.getId()); // Needed for updates
        event.setTitle(eventDTO.getTitle());
        event.setDescription(eventDTO.getDescription());
        event.setLocation(eventDTO.getLocation());
        event.setStartDate(eventDTO.getStartDate());
        event.setEndDate(eventDTO.getEndDate());
        event.setOrganizer(eventDTO.getOrganizer());
        event.setCapacity(eventDTO.getCapacity());
        event.setImage(eventDTO.getImage());
        event.setTargetAudience(eventDTO.getTargetAudience());
        event.setSpeaker(eventDTO.getSpeaker());
        event.setTravelPlan(eventDTO.getTravelPlan());
        event.setTransportation(eventDTO.getTransportation());
        // Status, Registrations, createdBy, organizers are handled separately
        return event;
    }


    @Transactional(readOnly = true)
    public List<Event> getAllEvents() {
        // TODO: Consider fetching organizers eagerly or mapping to DTO here if needed for list view
        return eventRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<Event> getEventById(Long id) {
        // TODO: Consider fetching organizers eagerly if needed for detail view
        return eventRepository.findById(id);
    }

    @Transactional
    public Event createEvent(EventDTO eventDTO, String creatorEmail) {
        Event event = convertToEntity(eventDTO);
        event.setStatus(EventStatus.PENDING); // New events are pending approval
        event.setRegistrations(0);
        event.setCreatedBy(creatorEmail);
        
        // Handle organizers
        if (eventDTO.getOrganizerIds() != null && !eventDTO.getOrganizerIds().isEmpty()) {
            List<User> organizers = userRepository.findAllByIdIn(eventDTO.getOrganizerIds());
            if (organizers.size() != eventDTO.getOrganizerIds().size()) {
                // Handle case where some user IDs were not found (optional)
                System.err.println("Warning: Some organizer user IDs not found");
            }
            event.setOrganizers(new HashSet<>(organizers));
        }
        
        return eventRepository.save(event);
    }

    @Transactional
    public Event updateEvent(Long id, EventDTO eventDTO, String userEmail, String userRole) {
        Event existingEvent = eventRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Event not found with id: " + id));


        logger.info("Updating event ID: {}. Initial status: {}. User: {}, Role: {}", id, existingEvent.getStatus(), userEmail, userRole);

        boolean wasNeedsRevision = existingEvent.getStatus() == EventStatus.NEEDS_REVISION;

        // Update standard fields from DTO
        existingEvent.setTitle(eventDTO.getTitle());
        existingEvent.setDescription(eventDTO.getDescription());
        existingEvent.setLocation(eventDTO.getLocation());
        existingEvent.setStartDate(eventDTO.getStartDate());
        existingEvent.setEndDate(eventDTO.getEndDate());
        existingEvent.setOrganizer(eventDTO.getOrganizer());
        existingEvent.setCapacity(eventDTO.getCapacity());
        existingEvent.setImage(eventDTO.getImage());
        existingEvent.setTargetAudience(eventDTO.getTargetAudience());
        existingEvent.setSpeaker(eventDTO.getSpeaker());
        existingEvent.setTravelPlan(eventDTO.getTravelPlan());
        existingEvent.setTransportation(eventDTO.getTransportation());
        
        // Handle organizers update
        if (eventDTO.getOrganizerIds() != null) {
            existingEvent.getOrganizers().clear();
            if (!eventDTO.getOrganizerIds().isEmpty()) {
                List<User> organizers = userRepository.findAllByIdIn(eventDTO.getOrganizerIds());
                if (organizers.size() != eventDTO.getOrganizerIds().size()) {
                     System.err.println("Warning: Some organizer user IDs not found during update for event ID: " + id);
                }
                existingEvent.getOrganizers().addAll(organizers);
            }
        }

        // Status update logic
        if (wasNeedsRevision) {
            // If the event was NEEDS_REVISION and is being updated by an authorized user,
            // it transitions to PENDING, and rejection reason is cleared.
            existingEvent.setStatus(EventStatus.PENDING);
            existingEvent.setRejectionReason(null);
            logger.info("Event ID {} (was NEEDS_REVISION) is now PENDING after update by {}.", id, userEmail);
        } else if (eventDTO.getStatus() != null) {
            // If not transitioning from NEEDS_REVISION, AND user is Admin/Manager, AND DTO provides a status,
            // allow Admin/Manager to set status explicitly.
            // This also handles the case where an Admin might want to change a PENDING event to something else.
            if (existingEvent.getStatus() != eventDTO.getStatus()) { // Only log if status actually changes
                logger.info("Admin/Manager {} explicitly set status of event ID {} from {} to {}.", 
                            userEmail, id, existingEvent.getStatus(), eventDTO.getStatus());
            }
            existingEvent.setStatus(eventDTO.getStatus());
            // If status is changed to something other than NEEDS_REVISION, ensure reason is null
            if (eventDTO.getStatus() != EventStatus.NEEDS_REVISION) {
                 existingEvent.setRejectionReason(null);
            }
        } else if ( eventDTO.getStatus() != null && existingEvent.getStatus() == EventStatus.PENDING && eventDTO.getStatus() == EventStatus.CANCELLED) {
            // Allow creator to cancel their PENDING event
            logger.info("Creator {} cancelled their PENDING event ID {}.", userEmail, id);
            existingEvent.setStatus(EventStatus.CANCELLED);
        }
        // Otherwise, status remains unchanged unless modified by the above conditions.
        // For example, if an Organizer updates a PENDING or APPROVED event without changing status in DTO, status stays PENDING/APPROVED.

        Event savedEvent = eventRepository.save(existingEvent);
        logger.info("Event ID: {} updated successfully. Final status: {}.", savedEvent.getId(), savedEvent.getStatus());
        return savedEvent;
    }

    @Transactional
    public void deleteEvent(Long id, String userEmail, String userRole) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Event not found with id: " + id));

        // Authorization Check (Example - adapt to your security setup)
         if (!(userRole.equals("ADMIN") ||
              (userRole.equals("MANAGER") && event.getStatus() != EventStatus.COMPLETED) ||
              (userRole.equals("ORGANIZER") && event.getCreatedBy().equals(userEmail) && event.getStatus() == EventStatus.PENDING))) {
            throw new SecurityException("User not authorized to delete this event");
        }

        // Before deleting the event, you might need to handle related registrations
        // Option 1: Delete associated registrations
         List<Registration> registrations = registrationRepository.findByEventId(id);
         registrationRepository.deleteAll(registrations);
        
        // Option 2: Cascade delete (if configured in Event entity's Registration relationship)
        
        // Also need to clean up the relationship in the join table
        event.getOrganizers().clear(); // Remove associations before deleting event
        eventRepository.save(event); // Save the changes to the join table

        eventRepository.deleteById(id); // Finally delete the event
    }

    @Transactional
    public Event approveEvent(Long id, String userRole) {
         if (!(userRole.equals("ADMIN") || userRole.equals("MANAGER"))) {
            throw new SecurityException("User not authorized to approve events");
        }
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Event not found with id: " + id));
        if (event.getStatus() == EventStatus.PENDING) {
            event.setStatus(EventStatus.APPROVED);
            return eventRepository.save(event);
        } else {
            throw new IllegalStateException("Only pending events can be approved.");
        }
    }

    @Transactional
    public Event rejectEvent(Long id, String userRole, String reason) {
         if (!(userRole.equals("ADMIN") || userRole.equals("MANAGER"))) {
            throw new SecurityException("User not authorized to reject events");
        }
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Event not found with id: " + id));
        if (event.getStatus() == EventStatus.PENDING) {
            event.setStatus(EventStatus.NEEDS_REVISION);
            event.setRejectionReason(reason);
            return eventRepository.save(event);
        } else {
            throw new IllegalStateException("Only pending events can be rejected.");
        }
    }

    // Add methods for filtering based on user role, status, and search term
    @Transactional(readOnly = true)
    public List<Event> findEvents(String userEmail, String userRole, String statusFilter, String searchTerm) {
        // Trả về tất cả events không lọc gì cả
        // TODO: Implement actual filtering logic based on parameters
        return eventRepository.findAll();
    }
    
    /**
     * Register a user for an event
     * 
     * @param eventId The ID of the event to register for
     * @param userEmail The email of the registering user
     * @return The updated event with incremented registration count
     * @throws EntityNotFoundException If the event is not found
     * @throws IllegalStateException If the event is not approved or already full or user already registered
     */
    @Transactional
    public Event registerForEvent(Long eventId, String userEmail) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EntityNotFoundException("Event not found with id: " + eventId));

        // Check if event is approved
        if (event.getStatus() != EventStatus.APPROVED) {
            throw new IllegalStateException("Registration is only available for approved events");
        }

        // Check if event is at capacity
        if (event.getRegistrations() >= event.getCapacity()) {
            throw new IllegalStateException("Event is already at full capacity");
        }
        
        // Check if user is already registered with CONFIRMED status
        if (registrationRepository.existsByEventIdAndUserIdAndStatus(eventId, userEmail, "CONFIRMED")) {
            throw new IllegalStateException("User is already registered for this event");
        }

        // Look for existing registration record (e.g., a cancelled one)
        Optional<Registration> existingRegistration = registrationRepository.findByEventIdAndUserId(eventId, userEmail);
        Registration registration;
        
        if (existingRegistration.isPresent()) {
            // Reactivate the existing registration
            registration = existingRegistration.get();
            registration.setStatus("CONFIRMED");
            registration.setRegistrationDate(LocalDateTime.now());
        } else {
            // Create a new registration
            registration = new Registration(event, userEmail);
        }
        
        registrationRepository.save(registration);

        // Update the registration count on the event
        // Count only active registrations
        long activeRegistrations = registrationRepository.countByEventIdAndStatus(eventId, "CONFIRMED");
        event.setRegistrations((int) activeRegistrations);
        return eventRepository.save(event);
    }
    
    /**
     * Check if a user is registered for an event
     * 
     * @param eventId The ID of the event
     * @param userEmail The email of the user
     * @return true if the user is registered, false otherwise
     */
    @Transactional(readOnly = true)
    public boolean isUserRegisteredForEvent(Long eventId, String userEmail) {
        return registrationRepository.existsByEventIdAndUserIdAndStatus(eventId, userEmail, "CONFIRMED");
    }
    
    /**
     * Get all registrations for an event
     * 
     * @param eventId The ID of the event
     * @return List of registrations
     */
    @Transactional(readOnly = true)
    public List<Registration> getEventRegistrations(Long eventId) {
        return registrationRepository.findByEventId(eventId);
    }
    
    /**
     * Cancel a user's registration for an event
     * 
     * @param eventId The ID of the event
     * @param userEmail The email of the user
     * @return The updated event with decremented registration count
     * @throws EntityNotFoundException If the event or registration is not found
     */
    @Transactional
    public Event cancelRegistration(Long eventId, String userEmail) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EntityNotFoundException("Event not found with id: " + eventId));
                
        Registration registration = registrationRepository.findByEventIdAndUserId(eventId, userEmail)
                .orElseThrow(() -> new EntityNotFoundException("Registration not found for user: " + userEmail));
        
        // Only decrement count if the registration was previously confirmed
        boolean wasConfirmed = "CONFIRMED".equals(registration.getStatus());
        
        // Set status to cancelled
        registration.setStatus("CANCELLED");
        registrationRepository.save(registration);
        
        // Update registration count - count only active registrations
        long activeRegistrations = registrationRepository.countByEventIdAndStatus(eventId, "CONFIRMED");
        event.setRegistrations((int) activeRegistrations);
        return eventRepository.save(event);
    }

    @Transactional(readOnly = true)
    public List<UserRegistrationDTO> getRegisteredUsersForEvent(Long eventId) {
        eventRepository.findById(eventId)
                .orElseThrow(() -> new EntityNotFoundException("Event not found with id: " + eventId));
        List<Registration> registrations = registrationRepository.findByEventId(eventId);
        return registrations.stream()
                .map(reg -> {
                    User user = null;
                    if (reg.getUserId() != null && !reg.getUserId().isEmpty()) {
                        try {
                            // Convert userId from String to Long since we store it as String in Registration
                            Long userId = Long.parseLong(reg.getUserId());
                            Optional<User> userOpt = userRepository.findById(userId);
                            if(userOpt.isPresent()) {
                                user = userOpt.get();
                            } else {
                                logger.warn("User not found for ID: {} during DTO mapping.", reg.getUserId());
                            }
                        } catch (NumberFormatException e) {
                            logger.error("Invalid user ID format: {} - {}", reg.getUserId(), e.getMessage());
                        } catch (Exception e) {
                            logger.error("Error fetching user {}: {}", reg.getUserId(), e.getMessage());
                        }
                    }
                    return new UserRegistrationDTO(user, reg);
                })
                .collect(java.util.stream.Collectors.toList());
    }
    
    @Transactional
    public Registration checkInAttendee(Long eventId, Long registrationId) {
        Registration registration = registrationRepository.findByIdAndEventId(registrationId, eventId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Registration not found with ID: " + registrationId + " for event ID: " + eventId));

        if (registration.getAttended()) {
            throw new IllegalStateException("Attendee is already checked in.");
        }

        registration.setAttended(true);
        registration.setStatus("CONFIRMED"); // Assuming check-in confirms attendance
        registration.setCheckInTime(LocalDateTime.now()); // Optional: add a check-in timestamp
        
        return registrationRepository.save(registration);
    }
} 