package com.ems.ems.service;

import com.ems.ems.model.User;
import java.util.Optional;

public interface UserService {
    User getCurrentUser();
    Optional<User> findByUsername(String username);
    Optional<User> getUserById(Long id);
} 