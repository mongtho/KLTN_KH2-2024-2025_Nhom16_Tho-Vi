package com.ems.ems.repository;

import com.ems.ems.model.News;
import com.ems.ems.model.NewsStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NewsRepository extends JpaRepository<News, Long> {
    List<News> findByStatus(NewsStatus status);
    List<News> findByStatusOrderByCreatedAtDesc(NewsStatus status);
} 