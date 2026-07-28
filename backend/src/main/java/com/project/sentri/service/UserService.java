package com.project.sentri.service;

import com.project.sentri.dto.AuthSyncRequest;
import com.project.sentri.dto.AuthSyncResponse;
import com.project.sentri.entity.Admin;
import com.project.sentri.entity.Client;
import com.project.sentri.entity.Professional;
import com.project.sentri.entity.User;
import com.project.sentri.repository.ClientRepository;
import com.project.sentri.repository.ProfessionalRepository;
import com.project.sentri.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final ClientRepository clientRepository;
    private final ProfessionalRepository professionalRepository;

    @Transactional
    public AuthSyncResponse syncUser(UUID userId, String email, AuthSyncRequest request) {
        User user = userRepository.findById(userId).orElse(null);

        if (user != null) {
            if (request.getFullName() != null && !request.getFullName().isBlank()) {
                user.setFullName(request.getFullName());
            }
            if (request.getPhone() != null && !request.getPhone().isBlank()) {
                user.setPhone(request.getPhone());
            }
            User updated = userRepository.save(user);
            return toResponse(updated);
        }

        String role = (request.getRole() != null && !request.getRole().isBlank()) 
                ? request.getRole().toLowerCase() 
                : "client";

        String fullName = (request.getFullName() != null && !request.getFullName().isBlank()) 
                ? request.getFullName() 
                : (email != null ? email.split("@")[0] : "User");

        String phone = (request.getPhone() != null) ? request.getPhone() : "";

        if ("professional".equals(role)) {
            Professional pro = Professional.builder()
                    .id(userId)
                    .email(email)
                    .fullName(fullName)
                    .phone(phone)
                    .bio(request.getBio() != null ? request.getBio() : "")
                    .hourlyRate(request.getHourlyRate() != null ? request.getHourlyRate() : new BigDecimal("50.00"))
                    .specializations(request.getSpecializations() != null ? request.getSpecializations() : List.of())
                    .operatingLocations(request.getOperatingLocations() != null ? request.getOperatingLocations() : List.of())
                    .availabilityStatus("available")
                    .verificationStatus("unverified")
                    .baseScore(100)
                    .aiAdjustment(0)
                    .trustScore(100)
                    .completedJobsCount(0)
                    .build();
            Professional saved = professionalRepository.save(pro);
            return toResponse(saved);
        } else if ("admin".equals(role)) {
            Admin admin = Admin.builder()
                    .id(userId)
                    .email(email)
                    .fullName(fullName)
                    .phone(phone)
                    .build();
            Admin saved = userRepository.save(admin);
            return toResponse(saved);
        } else {
            Client client = Client.builder()
                    .id(userId)
                    .email(email)
                    .fullName(fullName)
                    .phone(phone)
                    .assessmentCreditsRemaining(3)
                    .creditsResetAt(OffsetDateTime.now().plusMonths(1))
                    .build();
            Client saved = clientRepository.save(client);
            return toResponse(saved);
        }
    }

    private AuthSyncResponse toResponse(User user) {
        return AuthSyncResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
