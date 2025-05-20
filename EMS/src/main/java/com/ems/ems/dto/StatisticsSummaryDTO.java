package com.ems.ems.dto;

import java.util.List;
import java.util.Map;

public class StatisticsSummaryDTO {

    // Event Counts
    private long totalEvents;
    private long pendingEvents;
    private long approvedEvents;
    private long completedEvents;
    private long cancelledEvents;
    private long upcomingEvents;

    // User Counts
    private long totalUsers;
    private long adminUsers;
    private long managerUsers;
    private long organizerUsers;
    private long staffUsers;
    private long regularUsers; // Assuming a default "USER" role

    // Registration Counts
    private long totalRegistrations;
    private long confirmedRegistrations;
    private long cancelledRegistrations;
    // Add waitlisted if used

    // Other Counts
    private long totalDepartments;
    private long totalOffices;

    // Chart Data
    private List<CountByStatusDTO> eventsByStatus;
    private List<CountByRoleDTO> usersByRole;
    private List<CountByDateDTO> registrationsLast30Days;

    // --- Getters & Setters ---
    // (Generate getters and setters for all fields)


    public long getTotalEvents() {
        return totalEvents;
    }

    public void setTotalEvents(long totalEvents) {
        this.totalEvents = totalEvents;
    }

    public long getPendingEvents() {
        return pendingEvents;
    }

    public void setPendingEvents(long pendingEvents) {
        this.pendingEvents = pendingEvents;
    }

    public long getApprovedEvents() {
        return approvedEvents;
    }

    public void setApprovedEvents(long approvedEvents) {
        this.approvedEvents = approvedEvents;
    }

    public long getCompletedEvents() {
        return completedEvents;
    }

    public void setCompletedEvents(long completedEvents) {
        this.completedEvents = completedEvents;
    }

    public long getCancelledEvents() {
        return cancelledEvents;
    }

    public void setCancelledEvents(long cancelledEvents) {
        this.cancelledEvents = cancelledEvents;
    }

    public long getUpcomingEvents() {
        return upcomingEvents;
    }

    public void setUpcomingEvents(long upcomingEvents) {
        this.upcomingEvents = upcomingEvents;
    }

    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public long getAdminUsers() {
        return adminUsers;
    }

    public void setAdminUsers(long adminUsers) {
        this.adminUsers = adminUsers;
    }

    public long getManagerUsers() {
        return managerUsers;
    }

    public void setManagerUsers(long managerUsers) {
        this.managerUsers = managerUsers;
    }

    public long getOrganizerUsers() {
        return organizerUsers;
    }

    public void setOrganizerUsers(long organizerUsers) {
        this.organizerUsers = organizerUsers;
    }

    public long getStaffUsers() {
        return staffUsers;
    }

    public void setStaffUsers(long staffUsers) {
        this.staffUsers = staffUsers;
    }

    public long getRegularUsers() {
        return regularUsers;
    }

    public void setRegularUsers(long regularUsers) {
        this.regularUsers = regularUsers;
    }

    public long getTotalRegistrations() {
        return totalRegistrations;
    }

    public void setTotalRegistrations(long totalRegistrations) {
        this.totalRegistrations = totalRegistrations;
    }

    public long getConfirmedRegistrations() {
        return confirmedRegistrations;
    }

    public void setConfirmedRegistrations(long confirmedRegistrations) {
        this.confirmedRegistrations = confirmedRegistrations;
    }

    public long getCancelledRegistrations() {
        return cancelledRegistrations;
    }

    public void setCancelledRegistrations(long cancelledRegistrations) {
        this.cancelledRegistrations = cancelledRegistrations;
    }

    public long getTotalDepartments() {
        return totalDepartments;
    }

    public void setTotalDepartments(long totalDepartments) {
        this.totalDepartments = totalDepartments;
    }

    public long getTotalOffices() {
        return totalOffices;
    }

    public void setTotalOffices(long totalOffices) {
        this.totalOffices = totalOffices;
    }

    public List<CountByStatusDTO> getEventsByStatus() {
        return eventsByStatus;
    }

    public void setEventsByStatus(List<CountByStatusDTO> eventsByStatus) {
        this.eventsByStatus = eventsByStatus;
    }

    public List<CountByRoleDTO> getUsersByRole() {
        return usersByRole;
    }

    public void setUsersByRole(List<CountByRoleDTO> usersByRole) {
        this.usersByRole = usersByRole;
    }

    public List<CountByDateDTO> getRegistrationsLast30Days() {
        return registrationsLast30Days;
    }

    public void setRegistrationsLast30Days(List<CountByDateDTO> registrationsLast30Days) {
        this.registrationsLast30Days = registrationsLast30Days;
    }
} 