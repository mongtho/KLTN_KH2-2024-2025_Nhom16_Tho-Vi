package com.ems.ems.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "offices") // Using 'offices' for the table name
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Office {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name; // Tên phòng ban

    @Column(length = 1000)
    private String description; // Mô tả

    private String officeHead; // Trưởng phòng

    private String location; // Vị trí

    @Column(unique = true)
    private String contactEmail; // Email liên hệ

    private String contactPhone; // Số điện thoại liên hệ

    private String website; // Website

    private String logoUrl; // URL Logo
} 