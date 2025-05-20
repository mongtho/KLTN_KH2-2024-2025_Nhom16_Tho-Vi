package com.ems.ems.controller;

import com.ems.ems.dto.RejectRequest;
import com.ems.ems.model.Communication;
import com.ems.ems.service.CommunicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize; // For authorization
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.net.URI;
import java.util.Optional;

@RestController
@RequestMapping("/api/communications")
public class CommunicationController {
    private static final Logger logger = LoggerFactory.getLogger(CommunicationController.class);

    @Autowired
    private CommunicationService communicationService;


    // Approve Communication (accessible by ADMIN/MANAGER)
    @PostMapping("/{id}/approve")
    public ResponseEntity<?> approveCommunication(@PathVariable Long id) {
        logger.info("Received request to approve communication with ID: {}", id);
        try {
            Optional<Communication> approvedCommOpt = communicationService.approveCommunication(id);
            if (approvedCommOpt.isPresent()) {
                return ResponseEntity.ok(approvedCommOpt.get());
            } else {
                return ResponseEntity.status(404).body("Communication not found or could not be approved");
            }
        } catch (Exception e) {
            logger.error("Error approving communication: {}", e.getMessage());
            return ResponseEntity.status(500).body("Server error: " + e.getMessage());
        }
    }

    // Create Communication (accessible by authenticated users)
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Communication> createCommunication(@RequestBody Communication communication) {
        Communication createdComm = communicationService.createCommunication(communication);
        return ResponseEntity.created(URI.create("/api/communications/" + createdComm.getId()))
                             .body(createdComm);
    }

    // Get All Communications (accessible by all)
    @GetMapping
    public ResponseEntity<List<Communication>> getAllCommunications() {
        List<Communication> communications = communicationService.getAllCommunications();
        return ResponseEntity.ok(communications);
    }

    // Get Communication by ID (accessible by all)
    @GetMapping("/{id}")
    public ResponseEntity<Communication> getCommunicationById(@PathVariable Long id) {
        // Optional: Increment views here if needed
        // communicationService.incrementViews(id);
        return communicationService.getCommunicationById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Update Communication (accessible by ADMIN/MANAGER or author - implement logic in service)
    @PutMapping("/{id}")
    public ResponseEntity<Communication> updateCommunication(@PathVariable Long id, @RequestBody Communication communicationDetails) {
        return communicationService.updateCommunication(id, communicationDetails)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Delete Communication (accessible by ADMIN - implement logic in service)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCommunication(@PathVariable Long id) {
        boolean deleted = communicationService.deleteCommunication(id);
        return deleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }


    // Reject Communication (accessible by ADMIN/MANAGER)
    @PostMapping("/{id}/reject")
    public ResponseEntity<?> rejectCommunication(@PathVariable Long id, @RequestBody RejectRequest rejectRequest) {
        logger.info("Received request to reject communication with ID: {}, reason: {}", id, rejectRequest.getReason());
        try {
            if (rejectRequest.getReason() == null || rejectRequest.getReason().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Rejection reason cannot be empty");
            }
            
            Optional<Communication> rejectedCommOpt = communicationService.rejectCommunication(id, rejectRequest.getReason());
            if (rejectedCommOpt.isPresent()) {
                return ResponseEntity.ok(rejectedCommOpt.get());
            } else {
                return ResponseEntity.status(404).body("Communication not found or could not be rejected");
            }
        } catch (Exception e) {
            logger.error("Error rejecting communication: {}", e.getMessage());
            return ResponseEntity.status(500).body("Server error: " + e.getMessage());
        }
    }

    // Unapprove Communication (accessible by ADMIN/MANAGER)
    @PostMapping("/{id}/unapprove")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')") // Ensure only authorized roles can unapprove
    public ResponseEntity<?> unapproveCommunication(@PathVariable Long id, @RequestBody RejectRequest unapproveRequest) {
        logger.info("Received request to unapprove communication with ID: {}, reason: {}", id, unapproveRequest.getReason());
        try {
            if (unapproveRequest.getReason() == null || unapproveRequest.getReason().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Unapproval reason cannot be empty");
            }
            
            Optional<Communication> unapprovedCommOpt = communicationService.unapproveCommunication(id, unapproveRequest.getReason());
            if (unapprovedCommOpt.isPresent()) {
                return ResponseEntity.ok(unapprovedCommOpt.get());
            } else {
                // More specific error might be: "Communication not found, not published, or could not be unapproved"
                return ResponseEntity.status(404).body("Communication not found, not in a state to be unapproved, or operation failed");
            }
        } catch (Exception e) {
            logger.error("Error unapproving communication: {}", e.getMessage());
            return ResponseEntity.status(500).body("Server error: " + e.getMessage());
        }
    }

    // Optional: Submit for Approval (accessible by author - implement logic in service)
    @PostMapping("/{id}/submit")
    public ResponseEntity<Communication> submitForApproval(@PathVariable Long id) {
        return communicationService.submitForApproval(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(400).build());
    }

    // Optional: Increment Shares (e.g., when a share button is clicked)
    @PostMapping("/{id}/share")
    public ResponseEntity<Void> incrementShares(@PathVariable Long id) {
        communicationService.incrementShares(id);
        return ResponseEntity.ok().build();
    }
} 