package com.ems.ems;

import com.ems.ems.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class KickzHubApplication implements CommandLineRunner {

	@Autowired
	private AuthService authService;

	public static void main(String[] args) {
		SpringApplication.run(KickzHubApplication.class, args);
	}

	@Override
	public void run(String... args) throws Exception {
		authService.createDefaultAdmin();
	}

}
