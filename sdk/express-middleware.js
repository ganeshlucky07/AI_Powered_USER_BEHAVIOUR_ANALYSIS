/**
 * Express.js Middleware for Risk Score Integration
 * Automatically tracks and analyzes user behavior in Express apps
 */

const axios = require('axios');

class RiskScoreMiddleware {
  constructor(config) {
    this.apiUrl = config.apiUrl || 'http://localhost:8080/api';
    this.token = config.token || null;
    this.threshold = config.threshold || 70; // Risk score threshold for blocking
    this.blockOnHighRisk = config.blockOnHighRisk || false;
    this.onHighRisk = config.onHighRisk || null;
    
    // In-memory session store (use Redis in production)
    this.sessions = new Map();
  }

  /**
   * Main middleware function
   */
  middleware() {
    const middleware = this;
    
    return async (req, res, next) => {
      const sessionId = req.sessionID || req.headers['x-session-id'] || req.ip;
      
      // Initialize or get session
      if (!middleware.sessions.has(sessionId)) {
        middleware.sessions.set(sessionId, {
          id: sessionId,
          loginTime: new Date().getHours(),
          failedAttempts: 0,
          lastLocation: req.headers['x-forwarded-for'] || req.ip,
          locationChange: false,
          apiCalls: 0,
          requests: [],
          userAgent: req.headers['user-agent'],
          startTime: Date.now()
        });
      }
      
      const session = middleware.sessions.get(sessionId);
      session.apiCalls++;
      
      // Track request patterns
      session.requests.push({
        url: req.originalUrl,
        method: req.method,
        time: Date.now()
      });
      
      // Check for repeated requests (potential bot/attack)
      const recentRequests = session.requests.filter(r => 
        r.time > Date.now() - 60000 && r.url === req.originalUrl
      );
      
      if (recentRequests.length > 10) {
        console.warn(`⚠️ Risk Middleware: Rate limit exceeded for ${sessionId}`);
        return res.status(429).json({ 
          error: 'Too many requests',
          riskScore: 100,
          action: 'blocked'
        });
      }
      
      // Attach risk data to request
      req.riskData = middleware.prepareRiskData(session, req);
      
      // For sensitive routes (login, transactions), analyze risk
      const sensitiveRoutes = ['/login', '/api/auth/login', '/api/transaction', '/api/payment'];
      if (sensitiveRoutes.some(route => req.path.includes(route))) {
        try {
          const result = await middleware.analyze(req.riskData);
          req.riskScore = result;
          
          // Block if high risk and configured
          if (result.level === 'HIGH' && middleware.blockOnHighRisk) {
            console.warn(`🚫 Risk Middleware: Blocked high-risk request from ${sessionId}`);
            return res.status(403).json({
              error: 'Request blocked due to high risk',
              riskScore: result.risk,
              level: result.level
            });
          }
          
          // Trigger callback for high risk
          if (result.level === 'HIGH' && middleware.onHighRisk) {
            middleware.onHighRisk(result, req, res);
          }
          
        } catch (err) {
          console.error('Risk analysis failed:', err);
          // Continue anyway - don't block on analysis failure
        }
      }
      
      next();
    };
  }

  /**
   * Track failed login attempts
   */
  trackFailedLogin(sessionId) {
    if (this.sessions.has(sessionId)) {
      const session = this.sessions.get(sessionId);
      session.failedAttempts++;
      
      // If multiple failures, flag as suspicious
      if (session.failedAttempts > 3) {
        console.warn(`⚠️ Multiple failed logins from ${sessionId}`);
      }
    }
  }

  /**
   * Check for location change
   */
  checkLocationChange(sessionId, currentIp) {
    if (this.sessions.has(sessionId)) {
      const session = this.sessions.get(sessionId);
      if (session.lastLocation !== currentIp) {
        session.locationChange = true;
        session.lastLocation = currentIp;
      }
    }
  }

  /**
   * Prepare risk data for analysis
   */
  prepareRiskData(session, req) {
    const oneMinuteAgo = Date.now() - 60000;
    const recentRequests = session.requests.filter(r => r.time > oneMinuteAgo);
    
    // Count repeated requests
    const urlCounts = {};
    session.requests.forEach(r => {
      urlCounts[r.url] = (urlCounts[r.url] || 0) + 1;
    });
    const maxRepeated = Math.max(...Object.values(urlCounts), 0);
    
    // Check for unusual endpoints
    const sensitivePatterns = ['/admin', '/config', '/internal', '/debug', '/api/admin'];
    const unusualAccess = session.requests.filter(r => 
      sensitivePatterns.some(pattern => r.url.includes(pattern))
    ).length;
    
    return {
      loginTime: session.loginTime,
      failAttempts: session.failedAttempts,
      locationChange: session.locationChange ? 1 : 0,
      txnAmount: req.body?.amount || req.body?.txnAmount || 0,
      // Advanced metrics
      apiCallsPerMinute: recentRequests.length,
      repeatedRequests: maxRepeated,
      unusualEndpointAccess: unusualAccess,
      sessionDuration: Math.floor((Date.now() - session.startTime) / 1000),
      userAgent: session.userAgent,
      ip: session.lastLocation
    };
  }

  /**
   * Send data to risk analysis API
   */
  async analyze(data) {
    try {
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`;
      }
      
      const response = await axios.post(`${this.apiUrl}/analyze`, data, { headers });
      return response.data;
    } catch (error) {
      // Fallback calculation if API unavailable
      console.error('Risk API unavailable, using fallback calculation');
      return this.fallbackCalculation(data);
    }
  }

  /**
   * Fallback risk calculation when API is down
   */
  fallbackCalculation(data) {
    let score = 0;
    
    if (data.loginTime < 6) score += 20;
    score += data.failAttempts * 8;
    if (data.locationChange === 1) score += 25;
    if (data.txnAmount > 5000) score += 30;
    else if (data.txnAmount > 2000) score += 15;
    if (data.apiCallsPerMinute > 100) score += 15;
    if (data.repeatedRequests > 5) score += 20;
    if (data.unusualEndpointAccess > 0) score += 25;
    
    score = Math.min(score, 100);
    const level = score <= 30 ? 'LOW' : score <= 70 ? 'MEDIUM' : 'HIGH';
    
    return { risk: score, level, fallback: true };
  }

  /**
   * Get session statistics
   */
  getSessionStats(sessionId) {
    return this.sessions.get(sessionId) || null;
  }

  /**
   * Clear all sessions (call periodically)
   */
  clearOldSessions(maxAge = 3600000) { // 1 hour default
    const now = Date.now();
    for (const [id, session] of this.sessions.entries()) {
      if (now - session.startTime > maxAge) {
        this.sessions.delete(id);
      }
    }
  }
}

module.exports = RiskScoreMiddleware;
