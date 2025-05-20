package com.ems.ems.service;

import com.ems.ems.dto.SliderDTO;
import com.ems.ems.model.Slider;
import com.ems.ems.repository.SliderRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SliderService {

    @Autowired
    private SliderRepository sliderRepository;

    public List<SliderDTO> getAllSliders() {
        return sliderRepository.findAllByOrderByDisplayOrderAsc()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<SliderDTO> getAllActiveSliders() {
        return sliderRepository.findAllByStatusTrueOrderByDisplayOrderAsc()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public SliderDTO getSliderById(Long id) {
        return sliderRepository.findById(id)
                .map(this::convertToDTO)
                .orElseThrow(() -> new EntityNotFoundException("Slider not found with id: " + id));
    }

    @Transactional
    public SliderDTO createSlider(SliderDTO sliderDTO) {
        Slider slider = new Slider();
        BeanUtils.copyProperties(sliderDTO, slider);
        slider = sliderRepository.save(slider);
        return convertToDTO(slider);
    }

    @Transactional
    public SliderDTO updateSlider(Long id, SliderDTO sliderDTO) {
        Slider slider = sliderRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Slider not found with id: " + id));
        
        BeanUtils.copyProperties(sliderDTO, slider, "id", "createdAt");
        slider = sliderRepository.save(slider);
        return convertToDTO(slider);
    }

    @Transactional
    public void deleteSlider(Long id) {
        if (!sliderRepository.existsById(id)) {
            throw new EntityNotFoundException("Slider not found with id: " + id);
        }
        sliderRepository.deleteById(id);
    }

    @Transactional
    public SliderDTO updateSliderStatus(Long id, Boolean status) {
        Slider slider = sliderRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Slider not found with id: " + id));
        
        slider.setStatus(status);
        slider = sliderRepository.save(slider);
        return convertToDTO(slider);
    }

    @Transactional
    public SliderDTO updateSliderOrder(Long id, Integer displayOrder) {
        Slider slider = sliderRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Slider not found with id: " + id));
        
        slider.setDisplayOrder(displayOrder);
        slider = sliderRepository.save(slider);
        return convertToDTO(slider);
    }

    private SliderDTO convertToDTO(Slider slider) {
        SliderDTO sliderDTO = new SliderDTO();
        BeanUtils.copyProperties(slider, sliderDTO);
        return sliderDTO;
    }
} 