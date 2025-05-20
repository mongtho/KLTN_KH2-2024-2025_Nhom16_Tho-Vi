package com.ems.ems.controller;

import com.ems.ems.dto.StatisticsSummaryDTO;
import com.ems.ems.service.StatisticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/statistics")
@CrossOrigin(origins = "*") // Adjust CORS policy as needed
public class StatisticsController {

    @Autowired
    private StatisticsService statisticsService;

    @GetMapping("/summary")
    public ResponseEntity<StatisticsSummaryDTO> getStatisticsSummary() {
        try {
            StatisticsSummaryDTO summary = statisticsService.getStatisticsSummary();
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            // Log the exception details
            System.err.println("Error fetching statistics summary: " + e.getMessage());
            e.printStackTrace(); // Consider using a proper logger
            // Return an appropriate error response
            return ResponseEntity.status(500).body(null); // Or a custom error DTO
        }
    }
} 