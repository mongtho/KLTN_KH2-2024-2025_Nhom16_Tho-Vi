package com.ems.ems.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "communications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Communication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title; // Tiêu đề

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CommunicationType type; // Loại (news, announcement, event)

    @Column(columnDefinition = "TEXT")
    private String content; // Nội dung

    private String imageUrl; // URL Hình ảnh

    private String authorName; // Tên tác giả (Lấy từ User? Hay nhập tay?)

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "office_id")
    private Office office;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt;
    private LocalDateTime publishedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 25)
    private CommunicationStatus status = CommunicationStatus.PENDING; // Trạng thái

    private String rejectReason; // Lý do từ chối

    private Integer views = 0; // Lượt xem
    private Integer shares = 0; // Lượt chia sẻ

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id")
    private User author; // Liên kết với người tạo

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approver_id")
    private User approver; // Người duyệt/từ chối

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        if (status == CommunicationStatus.PUBLISHED && publishedAt == null) {
            publishedAt = LocalDateTime.now();
        }
    }
} 