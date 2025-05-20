package com.ems.ems.service;

import com.ems.ems.model.Department;
import com.ems.ems.model.Office;
import com.ems.ems.model.User;
import com.ems.ems.repository.DepartmentRepository;
import com.ems.ems.repository.OfficeRepository;
import com.ems.ems.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import jakarta.persistence.EntityNotFoundException;

import java.util.List;
import java.util.Optional;

@Service
public class AuthService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private OfficeRepository officeRepository;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    private void setDepartmentAndOffice(User userToUpdate, User detailsProvider) {
        if (detailsProvider.getDepartment() != null && detailsProvider.getDepartment().getId() != null) {
            Department department = departmentRepository.findById(detailsProvider.getDepartment().getId())
                .orElseThrow(() -> new RuntimeException("Department not found with ID: " + detailsProvider.getDepartment().getId()));
            userToUpdate.setDepartment(department);
        } else {
            userToUpdate.setDepartment(null);
        }

        if (detailsProvider.getOffice() != null && detailsProvider.getOffice().getId() != null) {
            Office office = officeRepository.findById(detailsProvider.getOffice().getId())
                .orElseThrow(() -> new RuntimeException("Office not found with ID: " + detailsProvider.getOffice().getId()));
            userToUpdate.setOffice(office);
        } else {
            userToUpdate.setOffice(null);
        }
    }

    public User register(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        setDepartmentAndOffice(user, user);
        return userRepository.save(user);
    }

    public Optional<User> login(String username, String password) {
        return userRepository.findByUsername(username)
                .filter(user -> passwordEncoder.matches(password, user.getPassword()));
    }

    public void resetPassword(String username, String newPassword) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("User not found with username: " + username));
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public void updatePassword(String username, String newPassword) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("User not found with username: " + username));
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public User createDefaultAdmin() {
        if (userRepository.findByUsername("admin").isEmpty()) {
            User adminUser = new User();
            adminUser.setUsername("admin");
            adminUser.setPassword(passwordEncoder.encode("123456"));
            adminUser.setEmail("admin@example.com");
            adminUser.setPhone("1234567890");
            adminUser.setRole(User.Role.ADMIN);
            adminUser.setDepartment(null);
            adminUser.setOffice(null);
            return userRepository.save(adminUser);
        }
        return null;
    }

    public User addUser(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        setDepartmentAndOffice(user, user);
        return userRepository.save(user);
    }

    public User updateUser(Long id, User userDetails) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        user.setUsername(userDetails.getUsername());
        user.setEmail(userDetails.getEmail());
        user.setPhone(userDetails.getPhone());
        user.setRole(userDetails.getRole());
        user.setImageUrl(userDetails.getImageUrl());
        
        if (userDetails.getPassword() != null && !userDetails.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(userDetails.getPassword()));
        }

        setDepartmentAndOffice(user, userDetails);

        return userRepository.save(user);
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    public List<User> searchUsers(String username) {
        return userRepository.findByUsernameContaining(username);
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
               .orElseThrow(() -> new EntityNotFoundException("User not found with ID: " + id));
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }
}
