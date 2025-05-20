package com.ems.ems.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SliderDTO {
    private Long id;
    private String title;
    private String description;
    private String image;
    private String link;
    private Integer displayOrder;
    private Boolean status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
} 