package com.ems.ems.controller;

import com.ems.ems.dto.SliderDTO;
import com.ems.ems.service.SliderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sliders")
@CrossOrigin(origins = "*")
public class SliderController {

    @Autowired
    private SliderService sliderService;

    @GetMapping
    public ResponseEntity<List<SliderDTO>> getAllSliders() {
        return ResponseEntity.ok(sliderService.getAllSliders());
    }

    @GetMapping("/active")
    public ResponseEntity<List<SliderDTO>> getAllActiveSliders() {
        return ResponseEntity.ok(sliderService.getAllActiveSliders());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SliderDTO> getSliderById(@PathVariable Long id) {
        return ResponseEntity.ok(sliderService.getSliderById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<SliderDTO> createSlider(@RequestBody SliderDTO sliderDTO) {
        return ResponseEntity.ok(sliderService.createSlider(sliderDTO));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<SliderDTO> updateSlider(@PathVariable Long id, @RequestBody SliderDTO sliderDTO) {
        return ResponseEntity.ok(sliderService.updateSlider(id, sliderDTO));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<Void> deleteSlider(@PathVariable Long id) {
        sliderService.deleteSlider(id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<SliderDTO> updateSliderStatus(
            @PathVariable Long id,
            @RequestParam Boolean status) {
        return ResponseEntity.ok(sliderService.updateSliderStatus(id, status));
    }

    @PatchMapping("/{id}/order")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<SliderDTO> updateSliderOrder(
            @PathVariable Long id,
            @RequestParam Integer order) {
        return ResponseEntity.ok(sliderService.updateSliderOrder(id, order));
    }
} 