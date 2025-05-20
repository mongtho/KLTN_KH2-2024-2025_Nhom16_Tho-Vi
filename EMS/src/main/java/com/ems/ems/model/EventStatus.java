package com.ems.ems.model;

public enum EventStatus {
    PENDING,    // Chờ duyệt
    APPROVED,   // Đã duyệt
    REJECTED,   // Bị từ chối (chung chung, có thể không cho sửa lại)
    CANCELLED,  // Đã hủy (bởi người tạo hoặc admin trước khi diễn ra)
    COMPLETED,  // Đã hoàn thành
    NEEDS_REVISION // Cần chỉnh sửa (bị từ chối nhưng cho phép người tạo sửa lại)
} 