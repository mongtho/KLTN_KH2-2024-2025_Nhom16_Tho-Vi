package com.ems.ems.service.impl;

import com.ems.ems.dto.CountByDateDTO;
import com.ems.ems.dto.CountByRoleDTO;
import com.ems.ems.dto.CountByStatusDTO;
import com.ems.ems.dto.StatisticsSummaryDTO;
import com.ems.ems.model.EventStatus;
import com.ems.ems.model.User;
import com.ems.ems.repository.*;
import com.ems.ems.service.StatisticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigInteger;
import java.sql.Date;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class StatisticsServiceImpl implements StatisticsService {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RegistrationRepository registrationRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private OfficeRepository officeRepository;

    @Override
    public StatisticsSummaryDTO getStatisticsSummary() {
        StatisticsSummaryDTO summary = new StatisticsSummaryDTO();
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime thirtyDaysAgo = now.minusDays(30);

        // Event Counts
        summary.setTotalEvents(eventRepository.count());
        summary.setPendingEvents(eventRepository.countByStatus(EventStatus.PENDING));
        summary.setApprovedEvents(eventRepository.countByStatus(EventStatus.APPROVED));
        summary.setCompletedEvents(eventRepository.countByStatus(EventStatus.COMPLETED));
        summary.setCancelledEvents(eventRepository.countByStatus(EventStatus.CANCELLED));
        summary.setUpcomingEvents(eventRepository.countByStartDateAfter(now));

        // User Counts
        summary.setTotalUsers(userRepository.count());
        summary.setAdminUsers(userRepository.countByRole(User.Role.ADMIN));
        summary.setManagerUsers(userRepository.countByRole(User.Role.MANAGER));
        summary.setOrganizerUsers(userRepository.countByRole(User.Role.ORGANIZER));
        summary.setStaffUsers(userRepository.countByRole(User.Role.STAFF));
        summary.setRegularUsers(userRepository.countByRole(User.Role.USER));

        // Registration Counts
        summary.setTotalRegistrations(registrationRepository.count());
        summary.setConfirmedRegistrations(registrationRepository.countByStatus("CONFIRMED")); // Assuming status is String
        summary.setCancelledRegistrations(registrationRepository.countByStatus("CANCELLED"));

        // Other Counts
        summary.setTotalDepartments(departmentRepository.count());
        summary.setTotalOffices(officeRepository.count());

        // Chart Data - Events by Status
        List<CountByStatusDTO> eventsByStatus = eventRepository.countEventsByStatus().stream()
                .map(result -> new CountByStatusDTO(((EventStatus) result[0]).name(), (Long) result[1]))
                .collect(Collectors.toList());
        summary.setEventsByStatus(eventsByStatus);

        // Chart Data - Users by Role
        List<CountByRoleDTO> usersByRole = userRepository.countUsersByRole().stream()
                .map(result -> new CountByRoleDTO(((User.Role) result[0]).name(), (Long) result[1]))
                .collect(Collectors.toList());
        summary.setUsersByRole(usersByRole);

        // Chart Data - Registrations Last 30 Days
        List<CountByDateDTO> registrationsLast30Days = registrationRepository.countRegistrationsByDateSince(thirtyDaysAgo).stream()
             .map(result -> {
                // Handle potential ClassCastException from native query returning SQL Date
                LocalDate date;
                if (result[0] instanceof Date) {
                    date = ((Date) result[0]).toLocalDate();
                } else if (result[0] instanceof LocalDate) {
                    date = (LocalDate) result[0];
                } else {
                     // Handle unexpected type or log error
                     date = LocalDate.MIN; // Or some default/error value
                     System.err.println("Unexpected date type in registration count: " + result[0].getClass());
                 }
                // Handle potential ClassCastException for count (often BigInteger from native counts)
                long count = 0;
                 if (result[1] instanceof Number) {
                     count = ((Number) result[1]).longValue();
                 }
                return new CountByDateDTO(date, count);
            })
             .collect(Collectors.toList());
        summary.setRegistrationsLast30Days(registrationsLast30Days);

        return summary;
    }
} 