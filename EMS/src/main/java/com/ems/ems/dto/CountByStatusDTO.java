package com.ems.ems.dto;

// Used for chart data (e.g., events by status)
public class CountByStatusDTO {
    private String status;
    private long count;

    public CountByStatusDTO(String status, long count) {
        this.status = status;
        this.count = count;
    }

    // Getters & Setters
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public long getCount() { return count; }
    public void setCount(long count) { this.count = count; }
} 