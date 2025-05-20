package com.ems.ems.repository;

import com.ems.ems.model.Slider;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SliderRepository extends JpaRepository<Slider, Long> {
    List<Slider> findAllByStatusTrueOrderByDisplayOrderAsc();
    List<Slider> findAllByOrderByDisplayOrderAsc();
} 