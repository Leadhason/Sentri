package com.project.sentri.repository;

import com.project.sentri.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DocumentRepository extends JpaRepository<Document, UUID> {
    List<Document> findByProfessionalId(UUID professionalId);
    List<Document> findByStatus(String status);
    List<Document> findByProfessionalIdAndDocumentType(UUID professionalId, String documentType);
}
