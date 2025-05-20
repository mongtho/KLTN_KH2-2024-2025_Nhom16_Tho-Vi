package com.ems.ems.service;

import com.ems.ems.model.Department;
import com.ems.ems.repository.DepartmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class DepartmentService {

    @Autowired
    private DepartmentRepository departmentRepository;

    @Transactional
    public Department createDepartment(Department department) {
        // Add any validation or business logic before saving
        return departmentRepository.save(department);
    }

    public List<Department> getAllDepartments() {
        return departmentRepository.findAll();
    }

    public Optional<Department> getDepartmentById(Long id) {
        return departmentRepository.findById(id);
    }

    @Transactional
    public Optional<Department> updateDepartment(Long id, Department departmentDetails) {
        return departmentRepository.findById(id).map(existingDepartment -> {
            existingDepartment.setName(departmentDetails.getName());
            existingDepartment.setDescription(departmentDetails.getDescription());
            existingDepartment.setHeadOfDepartment(departmentDetails.getHeadOfDepartment());
            existingDepartment.setEstablishmentYear(departmentDetails.getEstablishmentYear());
            existingDepartment.setLocation(departmentDetails.getLocation());
            existingDepartment.setContactEmail(departmentDetails.getContactEmail());
            existingDepartment.setContactPhone(departmentDetails.getContactPhone());
            existingDepartment.setWebsite(departmentDetails.getWebsite());
            existingDepartment.setLogoUrl(departmentDetails.getLogoUrl());
            return departmentRepository.save(existingDepartment);
        });
    }

    @Transactional
    public boolean deleteDepartment(Long id) {
        return departmentRepository.findById(id).map(department -> {
            departmentRepository.delete(department);
            return true;
        }).orElse(false);
    }
} 