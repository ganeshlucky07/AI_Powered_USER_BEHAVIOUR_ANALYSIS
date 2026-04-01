package com.riskscore.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "user_activity")
public class UserActivity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "login_time")
    private Integer loginTime;
    
    @Column(name = "fail_attempts")
    private Integer failAttempts;
    
    @Column(name = "location_change")
    private Integer locationChange;
    
    @Column(name = "txn_amount")
    private Double txnAmount;
    
    @Column(name = "risk_score")
    private Integer riskScore;
    
    @Column(name = "risk_level")
    private String riskLevel;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
