package com.riskscore.repository;

import com.riskscore.model.UserActivity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserActivityRepository extends JpaRepository<UserActivity, Long> {
    List<UserActivity> findByRiskLevelOrderByCreatedAtDesc(String riskLevel);
    List<UserActivity> findAllByOrderByCreatedAtDesc();
}
