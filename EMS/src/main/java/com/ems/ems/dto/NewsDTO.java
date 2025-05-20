package com.ems.ems.dto;

import com.ems.ems.model.NewsStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NewsDTO {
    private Long id;
    private String title;
    private String content;
    private String image;
    private String authorName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private NewsStatus status;
} 