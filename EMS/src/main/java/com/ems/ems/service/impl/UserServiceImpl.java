package com.ems.ems.service.impl;

import com.ems.ems.exception.ResourceNotFoundException;
import com.ems.ems.model.User;
import com.ems.ems.repository.UserRepository;
import com.ems.ems.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    @Override
    public Optional<User> findByUsername(String username) {
        log.info("Attempting to find user by username: [{}]", username);
        Optional<User> userOptional = userRepository.findByUsername(username);
        if (userOptional.isPresent()) {
            log.info("User found: {}", userOptional.get().getUsername());
        } else {
            log.warn("User not found in repository for username: [{}]", username);
        }
        return userOptional;
    }

    @Override
    public Optional<User> getUserById(Long id) {
        log.info("Attempting to find user by ID: [{}]", id);
        Optional<User> userOptional = userRepository.findById(id);
        if (userOptional.isPresent()) {
            log.info("User found: {}", userOptional.get().getUsername());
        } else {
            log.warn("User not found in repository for ID: [{}]", id);
        }
        return userOptional;
    }
} 