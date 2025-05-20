package com.ems.ems.dto;

import java.time.LocalDate;

// Used for chart data (e.g., registrations over time)
public class CountByDateDTO {
    private LocalDate date;
    private long count;

    public CountByDateDTO(LocalDate date, long count) {
        this.date = date;
        this.count = count;
    }

    // Getters & Setters
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public long getCount() { return count; }
    public void setCount(long count) { this.count = count; }
} 