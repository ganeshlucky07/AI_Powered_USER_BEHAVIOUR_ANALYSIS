package com.riskscore.controller;

import com.riskscore.model.RiskRequest;
import com.riskscore.model.RiskResponse;
import com.riskscore.model.UserActivity;
import com.riskscore.service.RiskScoreService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class RiskScoreController {
    
    private final RiskScoreService riskScoreService;
    
    @PostMapping("/analyze")
    public ResponseEntity<RiskResponse> analyzeRisk(@RequestBody RiskRequest request) {
        RiskResponse response = riskScoreService.analyzeRisk(request);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/all")
    public ResponseEntity<List<UserActivity>> getAllActivities() {
        return ResponseEntity.ok(riskScoreService.getAllActivities());
    }
    
    @GetMapping("/high-risk")
    public ResponseEntity<List<UserActivity>> getHighRiskActivities() {
        return ResponseEntity.ok(riskScoreService.getHighRiskActivities());
    }
    
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Backend is running");
    }
}
