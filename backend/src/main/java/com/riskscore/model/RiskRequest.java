package com.riskscore.model;

import lombok.Data;

@Data
public class RiskRequest {
    private Integer loginTime;
    private Integer failAttempts;
    private Integer locationChange;
    private Double txnAmount;
}
