package com.project.sentri.entity;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.experimental.SuperBuilder;
import java.time.OffsetDateTime;

@Entity
@Table(name = "clients")
@DiscriminatorValue("client")
@PrimaryKeyJoinColumn(name = "id")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Client extends User {

    @Builder.Default
    @Column(name = "assessment_credits_remaining", nullable = false)
    private Integer assessmentCreditsRemaining = 3;

    @Column(name = "credits_reset_at", nullable = false)
    private OffsetDateTime creditsResetAt;
}
