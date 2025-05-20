package com.ems.ems.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Lấy đường dẫn tuyệt đối đến thư mục uploads
        Path uploadDir = Paths.get("EMS", "uploads").toAbsolutePath().normalize();
        String uploadPath = uploadDir.toString().replace("\\", "/");

        // Đăng ký resource handler cho đường dẫn /uploads/**
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + uploadPath + "/")
                .setCachePeriod(3600) // Cache 1 giờ
                .resourceChain(true);

        // Log đường dẫn để debug
        System.out.println("Upload directory path: " + uploadPath);
    }
} 