package com.sih.edlearn;

import com.sih.edlearn.entity.User;
import com.sih.edlearn.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@Slf4j
@SpringBootApplication
@ConfigurationPropertiesScan
public class EdlearnApplication {

    public static void main(String[] args) {
        SpringApplication.run(EdlearnApplication.class, args);
        log.info("✓ EdLearn application started successfully on port 8080");
    }

    /**
     * Seed admin user if not present on application startup.
     * This bean is optional and won't prevent startup if it fails.
     */
    @Bean
    public CommandLineRunner seedAdminUser(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            try {
                log.info("Initializing database with default admin user if needed...");

                try {
                    var adminOptional = userRepository.findByUsername("admin");
                    User admin;
                    if (adminOptional.isEmpty()) {
                        log.info("Admin user not found, creating...");
                        admin = User.builder()
                                .username("admin")
                                .email("admin@nabha.gov.in")
                                .password(passwordEncoder.encode("Admin@123"))
                                .fullName("Administrator")
                                .phone("9876543210")
                                .role(User.Role.ADMIN)
                                .status(User.Status.APPROVED)
                                .language(User.Language.HINDI)
                                .build();
                        userRepository.save(admin);
                        log.info("✓ Admin user created successfully!");
                        log.info("✓ Login with: username=admin, password=Admin@123");
                    } else {
                        admin = adminOptional.get();
                        // Ensure admin is always APPROVED (fix for pending approval issue)
                        if (admin.getStatus() != User.Status.APPROVED) {
                            log.info("Admin user exists but status is {}, updating to APPROVED...", admin.getStatus());
                            admin.setStatus(User.Status.APPROVED);
                            userRepository.save(admin);
                            log.info("✓ Admin user status updated to APPROVED");
                        } else {
                            log.info("✓ Admin user already exists and is APPROVED");
                        }
                    }
                } catch (Exception dbEx) {
                    log.warn("⚠ Warning: Could not connect to database during admin user initialization.");
                    log.warn("Database might not be running or tables not created yet.");
                    log.warn("Exception: {}", dbEx.getClass().getSimpleName());
                    log.warn("Message: {}", dbEx.getMessage());
                    log.info("Please ensure MySQL is running and schema is initialized.");
                    log.info("Run: mysql -u edlearn_user -p edlearn_db < docs/schema.sql");
                }
            } catch (Exception e) {
                log.warn("⚠ Warning: Could not seed admin user during startup.");
                log.warn("Exception details: {}", e.getMessage());
                log.info("This is non-critical. You can create admin user manually if needed");
            }
        };
    }
}

