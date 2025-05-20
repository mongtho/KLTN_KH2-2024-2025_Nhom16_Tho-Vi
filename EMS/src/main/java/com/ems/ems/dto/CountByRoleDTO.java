package com.ems.ems.dto;

// Used for chart data (e.g., users by role)
public class CountByRoleDTO {
    private String role;
    private long count;

    public CountByRoleDTO(String role, long count) {
        this.role = role;
        this.count = count;
    }

    // Getters & Setters
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public long getCount() { return count; }
    public void setCount(long count) { this.count = count; }
} 