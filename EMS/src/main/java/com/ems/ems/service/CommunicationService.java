package com.ems.ems.service;

import com.ems.ems.model.Communication;
import com.ems.ems.model.CommunicationStatus;
import com.ems.ems.model.Office;
import com.ems.ems.model.User;
import com.ems.ems.repository.CommunicationRepository;
import com.ems.ems.repository.OfficeRepository;
import com.ems.ems.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class CommunicationService {
    private static final Logger logger = LoggerFactory.getLogger(CommunicationService.class);

    @Autowired
    private CommunicationRepository communicationRepository;

    @Autowired
    private UserRepository userRepository; // Inject UserRepository to find users

    @Autowired
    private OfficeRepository officeRepository; // Inject OfficeRepository

    // Get current logged-in user (helper method)
    private Optional<User> getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        // Correctly return the Optional<User> from the repository
        return userRepository.findByUsername(username);
    }

    @Transactional
    public Communication createCommunication(Communication communication) {
        // Ensure author ID is provided in the request payload
        if (communication.getAuthor() == null || communication.getAuthor().getId() == null) {
            throw new RuntimeException("Author ID must be provided to create communication.");
        }
        Long authorId = communication.getAuthor().getId();
        User author = userRepository.findById(authorId)
            .orElseThrow(() -> new RuntimeException("Author not found with ID: " + authorId + ", cannot create communication"));

        // Validate and set Office based on provided ID
        if (communication.getOffice() != null && communication.getOffice().getId() != null) {
            Office office = officeRepository.findById(communication.getOffice().getId())
                .orElseThrow(() -> new RuntimeException("Office not found with ID: " + communication.getOffice().getId()));
            communication.setOffice(office);
        } else {
            // Handle case where office is required but not provided, or set to null if optional
             throw new RuntimeException("Office ID is required to create communication.");
            // communication.setOffice(null); // If office is optional
        }
        
        // Set author details (already fetched) and initial status
        communication.setAuthor(author); // Set the full author object
        communication.setAuthorName(author.getUsername());
        communication.setStatus(CommunicationStatus.PENDING);
        communication.setRejectReason(null);
        communication.setPublishedAt(null);
        
        // Save the communication
        return communicationRepository.save(communication);
    }

    public List<Communication> getAllCommunications() {
        // Add filtering/sorting logic if needed
        return communicationRepository.findAll();
    }

    public Optional<Communication> getCommunicationById(Long id) {
        return communicationRepository.findById(id);
    }

    @Transactional
    public Optional<Communication> updateCommunication(Long id, Communication communicationDetails) {
        return communicationRepository.findById(id).map(existingComm -> {
            
            // Update Office relationship
            if (communicationDetails.getOffice() != null && communicationDetails.getOffice().getId() != null) {
                 // Check if the office ID has changed
                if (existingComm.getOffice() == null || !existingComm.getOffice().getId().equals(communicationDetails.getOffice().getId())) {
                    Office office = officeRepository.findById(communicationDetails.getOffice().getId())
                        .orElseThrow(() -> new RuntimeException("Office not found with ID: " + communicationDetails.getOffice().getId()));
                    existingComm.setOffice(office);
                }
            } else {
                // Handle setting office to null if allowed, or throw error if required
                 throw new RuntimeException("Office ID is required for update.");
                 // existingComm.setOffice(null); // If office is optional
            }

            // Update other fields
            existingComm.setTitle(communicationDetails.getTitle());
            existingComm.setType(communicationDetails.getType());
            existingComm.setContent(communicationDetails.getContent());
            existingComm.setImageUrl(communicationDetails.getImageUrl());

            // Update status if provided (potentially only for ADMIN/MANAGER?)
            if (communicationDetails.getStatus() != null) {
                 // Optional: Add authorization check here if needed
                existingComm.setStatus(communicationDetails.getStatus());
                // If changing status to PUBLISHED, maybe set publishedAt?
                if (communicationDetails.getStatus() == CommunicationStatus.PUBLISHED && existingComm.getPublishedAt() == null) {
                     existingComm.setPublishedAt(LocalDateTime.now());
                }
            }

            return communicationRepository.save(existingComm);
        });
    }

    @Transactional
    public boolean deleteCommunication(Long id) {
        return communicationRepository.findById(id).map(comm -> {
            // Add permission checks (e.g., only author or admin can delete)
            communicationRepository.delete(comm);
            return true;
        }).orElse(false);
    }

    @Transactional
    public Optional<Communication> approveCommunication(Long id) {
        logger.info("Attempting to approve communication with ID: {}", id);
        
        Optional<Communication> commOpt = communicationRepository.findById(id);
        if (commOpt.isEmpty()) {
            logger.error("Communication with ID: {} not found", id);
            return Optional.empty();
        }
        
        Communication comm = commOpt.get();
        
        try {
            comm.setStatus(CommunicationStatus.PUBLISHED);
            comm.setRejectReason(null); // Clear reject reason
            comm.setPublishedAt(LocalDateTime.now());
            Communication savedComm = communicationRepository.save(comm);
            logger.info("Successfully approved communication with ID: {}", id);
            return Optional.of(savedComm);
        } catch (Exception e) {
            logger.error("Error while approving communication with ID: {}: {}", id, e.getMessage());
            return Optional.empty();
        }
    }

    @Transactional
    public Optional<Communication> rejectCommunication(Long id, String reason) {
        logger.info("Attempting to reject communication with ID: {}, reason: {}", id, reason);
        
        Optional<Communication> commOpt = communicationRepository.findById(id);
        if (commOpt.isEmpty()) {
            logger.error("Communication with ID: {} not found", id);
            return Optional.empty();
        }
        
        Communication comm = commOpt.get();
        
        try {
            comm.setStatus(CommunicationStatus.REJECTED);
            comm.setRejectReason(reason);
            Communication savedComm = communicationRepository.save(comm);
            logger.info("Successfully rejected communication with ID: {}", id);
            return Optional.of(savedComm);
        } catch (Exception e) {
            logger.error("Error while rejecting communication with ID: {}: {}", id, e.getMessage());
            return Optional.empty();
        }
    }

    @Transactional
    public Optional<Communication> unapproveCommunication(Long id, String reason) {
        logger.info("Attempting to unapprove communication with ID: {}, reason: {}", id, reason);
        
        Optional<Communication> commOpt = communicationRepository.findById(id);
        if (commOpt.isEmpty()) {
            logger.error("Communication with ID: {} not found for unapproval", id);
            return Optional.empty();
        }
        
        Communication comm = commOpt.get();
        
        // Only published communications can be unapproved
        if (comm.getStatus() != CommunicationStatus.PUBLISHED) {
            logger.warn("Communication with ID: {} is not PUBLISHED, cannot unapprove. Current status: {}", id, comm.getStatus());
            // Optionally throw an exception or return a specific response
            return Optional.empty(); 
        }
        
        try {
            comm.setStatus(CommunicationStatus.NEEDS_REVISION);
            comm.setRejectReason(reason); // Using rejectReason to store the unapproval reason
            comm.setPublishedAt(null); // Clear the published date
            Communication savedComm = communicationRepository.save(comm);
            logger.info("Successfully unapproved communication with ID: {}", id);
            return Optional.of(savedComm);
        } catch (Exception e) {
            logger.error("Error while unapproving communication with ID: {}: {}", id, e.getMessage());
            return Optional.empty();
        }
    }

    // Optional: Method to submit for approval
    @Transactional
    public Optional<Communication> submitForApproval(Long id) {
        return communicationRepository.findById(id).map(comm -> {
            if (comm.getStatus() == CommunicationStatus.DRAFT || comm.getStatus() == CommunicationStatus.NEEDS_REVISION) {
                comm.setStatus(CommunicationStatus.PENDING);
                comm.setRejectReason(null); // Clear reason when resubmitting
                return communicationRepository.save(comm);
            }
            return comm; 
        });
    }

    // Optional: Method to increment views (consider performance implications)
    @Transactional
    public void incrementViews(Long id) {
        communicationRepository.findById(id).ifPresent(comm -> {
            comm.setViews(comm.getViews() + 1);
            communicationRepository.save(comm); // Note: Saving on every view can be slow
        });
    }

     // Optional: Method to increment shares (consider performance implications)
    @Transactional
    public void incrementShares(Long id) {
        communicationRepository.findById(id).ifPresent(comm -> {
            comm.setShares(comm.getShares() + 1);
            communicationRepository.save(comm); // Note: Saving on every share can be slow
        });
    }
} 