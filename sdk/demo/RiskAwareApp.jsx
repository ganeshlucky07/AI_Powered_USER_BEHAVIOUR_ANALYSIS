/**
 * Demo: Integrated Risk Score Application
 * Shows how to use the SDK in a real login/transaction flow
 */

import React, { useState } from 'react';
import useRiskScore from './useRiskScore';

// Demo Application Component
const RiskAwareApp = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [amount, setAmount] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [alerts, setAlerts] = useState([]);

  // Initialize risk score tracking
  const { 
    riskScore, 
    riskLevel, 
    loading, 
    analyze, 
    trackBehavior,
    getSessionReport 
  } = useRiskScore({
    apiUrl: 'http://localhost:8080/api',
    token: localStorage.getItem('token'),
    onHighRisk: (result, data) => {
      addAlert(`🚨 HIGH RISK detected! Score: ${result.risk}. Action blocked.`, 'error');
    },
    onAnalysisComplete: (result) => {
      console.log('Risk analysis complete:', result);
    }
  });

  const addAlert = (message, type = 'info') => {
    const id = Date.now();
    setAlerts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setAlerts(prev => prev.filter(a => a.id !== id));
    }, 5000);
  };

  // Handle login with risk analysis
  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      // Analyze risk BEFORE allowing login
      const result = await analyze({
        loginTime: new Date().getHours(),
        failAttempts: loginAttempts,
        locationChange: 0,
        txnAmount: 0
      });

      if (result.level === 'HIGH') {
        addAlert('Login blocked due to suspicious behavior!', 'error');
        return;
      }

      // Simulate authentication check
      if (username === 'demo' && password === 'demo') {
        setLoggedIn(true);
        localStorage.setItem('token', 'demo-token');
        addAlert('Login successful!', 'success');
      } else {
        setLoginAttempts(prev => prev + 1);
        trackBehavior('failedLogin');
        addAlert(`Invalid credentials. Attempt ${loginAttempts + 1}/3`, 'warning');
        
        if (loginAttempts >= 2) {
          addAlert('⚠️ Multiple failed attempts detected - risk increased', 'error');
        }
      }
    } catch (err) {
      addAlert('Risk analysis failed', 'error');
    }
  };

  // Handle transaction with risk analysis
  const handleTransaction = async (e) => {
    e.preventDefault();
    
    const txnAmount = parseFloat(amount);
    
    try {
      // Analyze risk for this transaction
      const result = await analyze({
        loginTime: new Date().getHours(),
        failAttempts: 0,
        locationChange: 0,
        txnAmount: txnAmount
      });

      if (result.level === 'HIGH') {
        addAlert(`🚨 Transaction blocked! Risk score: ${result.risk}`, 'error');
        return;
      }

      if (result.level === 'MEDIUM') {
        addAlert(`⚠️ Transaction requires additional verification. Risk: ${result.risk}`, 'warning');
        // In real app: send OTP, require 2FA, etc.
        return;
      }

      addAlert(`✅ Transaction of $${txnAmount} approved! Risk: ${result.risk}`, 'success');
      setAmount('');
    } catch (err) {
      addAlert('Transaction analysis failed', 'error');
    }
  };

  // Get session report
  const showSessionReport = () => {
    const report = getSessionReport();
    console.log('Session Report:', report);
    addAlert(`Session: ${report.apiCalls} API calls, ${Math.floor(report.duration / 1000)}s duration`, 'info');
  };

  if (!loggedIn) {
    return (
      <div className="demo-app">
        <h2>🔐 Risk-Aware Login Demo</h2>
        
        {/* Alerts */}
        {alerts.map(alert => (
          <div key={alert.id} className={`alert alert-${alert.type}`}>
            {alert.message}
          </div>
        ))}

        {/* Risk Score Display */}
        {riskScore !== null && (
          <div className={`risk-banner risk-${riskLevel?.toLowerCase()}`}>
            <strong>Risk Score: {riskScore}</strong> ({riskLevel})
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Username (try: demo)</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
            />
          </div>

          <div className="form-group">
            <label>Password (try: demo)</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Analyzing Risk...' : 'Login with Risk Check'}
          </button>
        </form>

        <div className="info-box">
          <h4>💡 Try These Scenarios:</h4>
          <ul>
            <li>Login at 3 AM (high risk)</li>
            <li>Fail password 3+ times (high risk)</li>
            <li>Normal login at 2 PM (low risk)</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="demo-app">
      <h2>💰 Risk-Aware Transaction Demo</h2>
      <p>Welcome, {username}! Your current risk level: <strong>{riskLevel || 'N/A'}</strong></p>
      
      {/* Alerts */}
      {alerts.map(alert => (
        <div key={alert.id} className={`alert alert-${alert.type}`}>
          {alert.message}
        </div>
      ))}

      {/* Risk Score Display */}
      {riskScore !== null && (
        <div className={`risk-banner risk-${riskLevel?.toLowerCase()}`}>
          <strong>Current Risk Score: {riskScore}</strong> ({riskLevel})
        </div>
      )}

      <form onSubmit={handleTransaction}>
        <div className="form-group">
          <label>Transaction Amount ($)</label>
          <input 
            type="number" 
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Analyzing...' : 'Send Transaction'}
        </button>
      </form>

      <div className="button-group">
        <button onClick={showSessionReport} className="secondary">
          📊 View Session Report
        </button>
        <button onClick={() => setLoggedIn(false)} className="secondary">
          Logout
        </button>
      </div>

      <div className="info-box">
        <h4>💡 Try These Scenarios:</h4>
        <ul>
          <li>Small amount ($50) = Low risk</li>
          <li>Medium amount ($2500) = Medium risk</li>
          <li>Large amount ($10000) = High risk</li>
        </ul>
      </div>
    </div>
  );
};

export default RiskAwareApp;
