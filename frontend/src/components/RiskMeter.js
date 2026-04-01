import React from 'react';
import { AlertTriangle } from 'lucide-react';

const RiskMeter = ({ score, level }) => {
  // Calculate needle rotation (-90 to 90 degrees)
  const rotation = -90 + (score / 100) * 180;

  const getLevelClass = () => {
    switch (level) {
      case 'LOW': return 'low';
      case 'MEDIUM': return 'medium';
      case 'HIGH': return 'high';
      default: return 'low';
    }
  };

  return (
    <div>
      <div className="risk-meter">
        <div className="risk-meter-bg">
          <div 
            className="risk-meter-needle" 
            style={{ transform: `rotate(${rotation}deg)` }}
          />
          <div className="risk-meter-center" />
        </div>
      </div>
      
      <div className="risk-score-display">
        <div className={`risk-score-value ${getLevelClass()}`}>
          {score}
        </div>
        <span className={`risk-level-badge ${getLevelClass()}`}>
          {level === 'HIGH' && <AlertTriangle size={14} style={{ marginRight: '4px' }} />}
          {level} RISK
        </span>
      </div>
    </div>
  );
};

export default RiskMeter;
