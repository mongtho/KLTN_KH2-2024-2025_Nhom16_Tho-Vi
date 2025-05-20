package com.ems.ems.dto;

import com.ems.ems.model.Department;
import com.ems.ems.model.Office;
import com.ems.ems.model.Registration;
import com.ems.ems.model.User;

import java.time.LocalDateTime;

public class UserRegistrationDTO {

    // User fields
    private Long userId;
    private String username;
    private String email;
    private String imageUrl;
    private DepartmentSummaryDTO department;
    private OfficeSummaryDTO office;

    // Registration fields
    private Long registrationId;
    private LocalDateTime registrationDate;
    private String status;
    private Boolean attended;
    private String notes;

    // Constructor
    public UserRegistrationDTO() {
    }

    // Constructor to combine User and Registration data
    public UserRegistrationDTO(User user, Registration registration) {
        if (user != null) {
            this.userId = user.getId();
            this.username = user.getUsername();
            this.email = user.getEmail();
            this.imageUrl = user.getImageUrl();
            if (user.getDepartment() != null) {
                this.department = new DepartmentSummaryDTO(user.getDepartment());
            }
            if (user.getOffice() != null) {
                this.office = new OfficeSummaryDTO(user.getOffice());
            }
        }
        if (registration != null) {
            this.registrationId = registration.getId();
            this.registrationDate = registration.getRegistrationDate();
            this.status = registration.getStatus();
            this.attended = registration.getAttended();
            this.notes = registration.getNotes();
        }
    }

    // --- Summary DTOs (Inner classes for simplicity) ---
    public static class DepartmentSummaryDTO {
        private Long id;
        private String name;

        public DepartmentSummaryDTO(Department department) {
            if (department != null) {
                this.id = department.getId();
                this.name = department.getName();
            }
        }
        public Long getId() { return id; }
        public String getName() { return name; }
    }

    public static class OfficeSummaryDTO {
        private Long id;
        private String name;

        public OfficeSummaryDTO(Office office) {
             if (office != null) {
                this.id = office.getId();
                this.name = office.getName();
            }
        }
        public Long getId() { return id; }
        public String getName() { return name; }
    }

    // --- Getters and Setters for UserRegistrationDTO fields ---
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public DepartmentSummaryDTO getDepartment() { return department; }
    public void setDepartment(DepartmentSummaryDTO department) { this.department = department; }
    public OfficeSummaryDTO getOffice() { return office; }
    public void setOffice(OfficeSummaryDTO office) { this.office = office; }
    public Long getRegistrationId() { return registrationId; }
    public void setRegistrationId(Long registrationId) { this.registrationId = registrationId; }
    public LocalDateTime getRegistrationDate() { return registrationDate; }
    public void setRegistrationDate(LocalDateTime registrationDate) { this.registrationDate = registrationDate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Boolean getAttended() { return attended; }
    public void setAttended(Boolean attended) { this.attended = attended; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
} 