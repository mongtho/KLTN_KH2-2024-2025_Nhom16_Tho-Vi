package com.ems.ems.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "departments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(length = 1000)
    private String description;

    private String headOfDepartment;

    private Integer establishmentYear;

    private String location;

    @Column(unique = true)
    private String contactEmail;

    private String contactPhone;

    private String website;

    private String logoUrl;
} 