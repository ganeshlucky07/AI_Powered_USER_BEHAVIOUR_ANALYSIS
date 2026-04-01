package com.riskscore.service;

import com.riskscore.model.RiskRequest;
import com.riskscore.model.RiskResponse;
import com.riskscore.model.UserActivity;
import com.riskscore.repository.UserActivityRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class RiskScoreService {
    
    private final UserActivityRepository repository;
    private final WebClient.Builder webClientBuilder;
    
    @Value("${ai.service.url}")
    private String aiServiceUrl;
    
    public RiskResponse analyzeRisk(RiskRequest request) {
        RiskResponse aiResponse = callAIService(request);
        
        UserActivity activity = new UserActivity();
        activity.setLoginTime(request.getLoginTime());
        activity.setFailAttempts(request.getFailAttempts());
        activity.setLocationChange(request.getLocationChange());
        activity.setTxnAmount(request.getTxnAmount());
        activity.setRiskScore(aiResponse.getRisk());
        activity.setRiskLevel(aiResponse.getLevel());
        
        repository.save(activity);
        
        return aiResponse;
    }
    
    private RiskResponse callAIService(RiskRequest request) {
        try {
            return webClientBuilder.build()
                .post()
                .uri(aiServiceUrl + "/predict")
                .bodyValue(request)
                .retrieve()
                .bodyToMono(RiskResponse.class)
                .timeout(java.time.Duration.ofSeconds(5))
                .onErrorResume(e -> {
                    log.warn("AI service unavailable, using fallback: {}", e.getMessage());
                    return Mono.just(fallbackCalculation(request));
                })
                .block();
        } catch (Exception e) {
            log.warn("AI service error, using fallback: {}", e.getMessage());
            return fallbackCalculation(request);
        }
    }
    
    private RiskResponse fallbackCalculation(RiskRequest request) {
        int score = 0;
        
        // Unusual login times (late night: 0-5)
        if (request.getLoginTime() < 6) {
            score += 20;
        }
        
        // Failed attempts
        score += request.getFailAttempts() * 8;
        
        // Location change
        if (request.getLocationChange() == 1) {
            score += 25;
        }
        
        // High transaction amount
        if (request.getTxnAmount() > 5000) {
            score += 30;
        } else if (request.getTxnAmount() > 2000) {
            score += 15;
        }
        
        score = Math.min(score, 100);
        
        String level;
        if (score <= 30) {
            level = "LOW";
        } else if (score <= 70) {
            level = "MEDIUM";
        } else {
            level = "HIGH";
        }
        
        return new RiskResponse(score, level);
    }
    
    public List<UserActivity> getAllActivities() {
        return repository.findAllByOrderByCreatedAtDesc();
    }
    
    public List<UserActivity> getHighRiskActivities() {
        return repository.findByRiskLevelOrderByCreatedAtDesc("HIGH");
    }
}
