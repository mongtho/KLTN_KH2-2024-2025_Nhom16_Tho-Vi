package com.ems.ems.service;

import com.ems.ems.model.Office;
import com.ems.ems.repository.OfficeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class OfficeService {

    @Autowired
    private OfficeRepository officeRepository;

    @Transactional
    public Office createOffice(Office office) {
        return officeRepository.save(office);
    }

    public List<Office> getAllOffices() {
        return officeRepository.findAll();
    }

    public Optional<Office> getOfficeById(Long id) {
        return officeRepository.findById(id);
    }

    @Transactional
    public Optional<Office> updateOffice(Long id, Office officeDetails) {
        return officeRepository.findById(id).map(existingOffice -> {
            existingOffice.setName(officeDetails.getName());
            existingOffice.setDescription(officeDetails.getDescription());
            existingOffice.setOfficeHead(officeDetails.getOfficeHead());
            existingOffice.setLocation(officeDetails.getLocation());
            existingOffice.setContactEmail(officeDetails.getContactEmail());
            existingOffice.setContactPhone(officeDetails.getContactPhone());
            existingOffice.setWebsite(officeDetails.getWebsite());
            existingOffice.setLogoUrl(officeDetails.getLogoUrl());
            return officeRepository.save(existingOffice);
        });
    }

    @Transactional
    public boolean deleteOffice(Long id) {
        return officeRepository.findById(id).map(office -> {
            officeRepository.delete(office);
            return true;
        }).orElse(false);
    }
} 