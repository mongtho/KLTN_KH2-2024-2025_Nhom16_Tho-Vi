package com.ems.ems.model;

public enum CommunicationStatus {
    DRAFT,     // Bản nháp
    PENDING,   // Chờ duyệt
    PUBLISHED, // Đã đăng
    REJECTED,   // Bị từ chối
    NEEDS_REVISION // Cần chỉnh sửa (sau khi bị hủy phê duyệt)
} 