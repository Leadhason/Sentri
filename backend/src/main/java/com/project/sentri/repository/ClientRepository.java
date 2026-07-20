package com.project.sentri.repository;

import com.project.sentri.entity.Client;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface ClientRepository extends JpaRepository<Client, UUID> {
    List<Client> findByCreditsResetAtLessThanEqual(OffsetDateTime timestamp);
}
