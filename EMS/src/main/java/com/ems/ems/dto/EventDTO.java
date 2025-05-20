package com.ems.ems.dto;

import com.ems.ems.model.EventStatus;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;
import java.util.List;

public class EventDTO {

    private Long id; // Include ID for updates

    @NotBlank(message = "Title is mandatory")
    @Size(max = 255, message = "Title cannot exceed 255 characters")
    private String title;

    @NotBlank(message = "Description is mandatory")
    private String description;

    @NotBlank(message = "Location is mandatory")
    @Size(max = 255, message = "Location cannot exceed 255 characters")
    private String location;

    @NotNull(message = "Start date is mandatory")
    @FutureOrPresent(message = "Start date must be in the present or future")
    private LocalDateTime startDate;

    @NotNull(message = "End date is mandatory")
    @Future(message = "End date must be in the future")
    private LocalDateTime endDate;

    @NotBlank(message = "Organizer is mandatory") // Main organizing unit/person
    @Size(max = 255, message = "Organizer cannot exceed 255 characters")
    private String organizer;

    @NotNull(message = "Capacity is mandatory")
    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer capacity;

    @Size(max = 2048, message = "Image URL cannot exceed 2048 characters")
    private String image;

    @NotBlank(message = "Target audience is mandatory")
    private String targetAudience;

    // Remove the old organizingCommittee string field
    // @NotBlank(message = "Organizing committee is mandatory")
    // private String organizingCommittee;
    
    // Add field to receive organizer IDs from frontend
    private List<Long> organizerIds;
    
    // Add field to return organizer details in response (optional)
    private List<UserDTO> organizers;
    
    private String speaker;
    
    private String travelPlan;
    
    private String transportation;

    // Status is usually handled by the backend logic (e.g., default to PENDING)
    // but might be included for admin updates
    private EventStatus status;

    // Registrations are typically managed by the system
    private Integer registrations;

    // createdBy is usually set by the backend based on the authenticated user
    private String createdBy;

    // Add userId field to be sent from frontend
    private Long userId;

    // Custom validation: Ensure endDate is after startDate
    @AssertTrue(message = "End date must be after start date")
    public boolean isEndDateAfterStartDate() {
        return startDate != null && endDate != null && endDate.isAfter(startDate);
    }


    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public LocalDateTime getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDateTime startDate) {
        this.startDate = startDate;
    }

    public LocalDateTime getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDateTime endDate) {
        this.endDate = endDate;
    }

    public String getOrganizer() {
        return organizer;
    }

    public void setOrganizer(String organizer) {
        this.organizer = organizer;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public String getTargetAudience() {
        return targetAudience;
    }

    public void setTargetAudience(String targetAudience) {
        this.targetAudience = targetAudience;
    }

    // Remove getter/setter for old organizingCommittee
    // public String getOrganizingCommittee() { ... }
    // public void setOrganizingCommittee(String organizingCommittee) { ... }
    
    public List<Long> getOrganizerIds() {
        return organizerIds;
    }

    public void setOrganizerIds(List<Long> organizerIds) {
        this.organizerIds = organizerIds;
    }
    
    public List<UserDTO> getOrganizers() {
        return organizers;
    }

    public void setOrganizers(List<UserDTO> organizers) {
        this.organizers = organizers;
    }

    public String getSpeaker() {
        return speaker;
    }

    public void setSpeaker(String speaker) {
        this.speaker = speaker;
    }

    public String getTravelPlan() {
        return travelPlan;
    }

    public void setTravelPlan(String travelPlan) {
        this.travelPlan = travelPlan;
    }

    public String getTransportation() {
        return transportation;
    }

    public void setTransportation(String transportation) {
        this.transportation = transportation;
    }

    public EventStatus getStatus() {
        return status;
    }

    public void setStatus(EventStatus status) {
        this.status = status;
    }

    public Integer getRegistrations() {
        return registrations;
    }

    public void setRegistrations(Integer registrations) {
        this.registrations = registrations;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }
} 