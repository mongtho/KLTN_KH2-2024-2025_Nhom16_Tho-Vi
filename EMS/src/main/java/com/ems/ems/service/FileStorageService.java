package com.ems.ems.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.util.StringUtils;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

@Service
public class FileStorageService {
    private final Path fileStorageLocation;

    public FileStorageService() {
        // Tạo đường dẫn tới thư mục uploads trong thư mục EMS
        this.fileStorageLocation = Paths.get("EMS", "uploads")
                .toAbsolutePath().normalize();
    }

    @PostConstruct
    public void init() {
        try {
            // Tạo thư mục nếu chưa tồn tại
            Files.createDirectories(fileStorageLocation);
            System.out.println("Created directory at: " + fileStorageLocation);
        } catch (IOException ex) {
            throw new RuntimeException("Could not create upload directory!", ex);
        }
    }

    public String storeFile(MultipartFile file) {
        try {
            // Chuẩn hóa tên file
            String fileName = StringUtils.cleanPath(file.getOriginalFilename());

            // Kiểm tra tên file hợp lệ
            if (fileName.contains("..")) {
                throw new RuntimeException("Invalid file path sequence in filename: " + fileName);
            }

            // Copy file vào thư mục đích, ghi đè nếu đã tồn tại
            Path targetLocation = fileStorageLocation.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            return fileName;
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file. Please try again!", ex);
        }
    }

    public Path getFilePath(String fileName) {
        return fileStorageLocation.resolve(fileName).normalize();
    }

    public boolean deleteFile(String fileName) {
        try {
            Path file = fileStorageLocation.resolve(fileName);
            return Files.deleteIfExists(file);
        } catch (IOException ex) {
            throw new RuntimeException("Error deleting file: " + fileName, ex);
        }
    }
} 