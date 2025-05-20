package com.ems.ems.repository;

import com.ems.ems.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    List<User> findByUsernameContaining(String username);
    Optional<User> findByEmail(String email);
    
    // Find all users whose IDs are in the provided list
    List<User> findAllByIdIn(List<Long> ids);

    Boolean existsByUsername(String username);
    Boolean existsByEmail(String email);

    long countByRole(User.Role role);

    @Query("SELECT role, COUNT(u) FROM User u GROUP BY u.role")
    List<Object[]> countUsersByRole();
}
