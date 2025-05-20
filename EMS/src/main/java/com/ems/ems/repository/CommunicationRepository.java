package com.ems.ems.repository;

import com.ems.ems.model.Communication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CommunicationRepository extends JpaRepository<Communication, Long> {
    // Add custom query methods if needed, e.g., find by status or type
} 