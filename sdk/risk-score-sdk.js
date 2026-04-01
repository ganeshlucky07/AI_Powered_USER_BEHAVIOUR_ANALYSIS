/**
 * Risk Score SDK - JavaScript Client Library
 * Integrate risk scoring into any web application
 */

class RiskScoreSDK {
  constructor(config) {
    this.apiUrl = config.apiUrl || 'http://localhost:8080/api';
    this.apiKey = config.apiKey || null;
    this.token = config.token || null; // JWT token for authenticated requests
    this.onHighRisk = config.onHighRisk || null; // Callback for high risk alerts
    this.autoTrack = config.autoTrack !== false; // Auto-track by default
    
    // Track user session data
    this.sessionData = {
      loginTime: null,
      failedAttempts: 0,
      locationChange: false,
      lastLocation: null,
      apiCalls: 0,
      requests: [],
      startTime: Date.now()
    };
    
    if (this.autoTrack) {
      this.startTracking();
    }
  }

  /**
   * Start automatic behavior tracking
   */
  startTracking() {
    // Track page load time as login time
    this.sessionData.loginTime = new Date().getHours();
    
    // Track geolocation (if permitted)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          this.sessionData.lastLocation = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          };
        },
        () => {
          // Location denied - that's a data point too
          this.sessionData.locationChange = true;
        }
      );
    }

    // Track API calls
    this.interceptFetch();
    
    console.log('🔍 Risk Score SDK: Tracking started');
  }

  /**
   * Intercept fetch calls to track API behavior
   */
  interceptFetch() {
    const originalFetch = window.fetch;
    const sdk = this;
    
    window.fetch = function(...args) {
      sdk.sessionData.apiCalls++;
      sdk.sessionData.requests.push({
        url: args[0],
        time: Date.now(),
        method: args[1]?.method || 'GET'
      });
      
      // Detect repeated requests to same endpoint
      const url = args[0];
      const sameUrlCount = sdk.sessionData.requests.filter(r => r.url === url).length;
      if (sameUrlCount > 3) {
        console.warn('⚠️ Risk SDK: Repeated requests detected to', url);
      }
      
      return originalFetch.apply(this, args);
    };
  }

  /**
   * Record a failed login attempt
   */
  recordFailedLogin() {
    this.sessionData.failedAttempts++;
    console.log('🔍 Risk SDK: Failed login recorded. Total:', this.sessionData.failedAttempts);
  }

  /**
   * Record location change
   */
  recordLocationChange(newLocation) {
    if (this.sessionData.lastLocation) {
      const distance = this.calculateDistance(
        this.sessionData.lastLocation,
        newLocation
      );
      
      // If distance > 100km in short time, flag as suspicious
      if (distance > 100) {
        this.sessionData.locationChange = true;
        console.warn('⚠️ Risk SDK: Large location jump detected:', distance, 'km');
      }
    }
    
    this.sessionData.lastLocation = newLocation;
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  calculateDistance(loc1, loc2) {
    const R = 6371; // Earth's radius in km
    const dLat = (loc2.lat - loc1.lat) * Math.PI / 180;
    const dLon = (loc2.lng - loc1.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc2.lat * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  /**
   * Analyze current behavior and get risk score
   */
  async analyze(data = {}) {
    const payload = {
      loginTime: data.loginTime || this.sessionData.loginTime,
      failAttempts: data.failAttempts || this.sessionData.failedAttempts,
      locationChange: data.locationChange !== undefined ? data.locationChange : (this.sessionData.locationChange ? 1 : 0),
      txnAmount: data.txnAmount || 0,
      // New advanced fields
      apiCallsPerMinute: this.calculateApiRate(),
      repeatedRequests: this.getRepeatedRequestCount(),
      unusualEndpointAccess: this.checkUnusualEndpoints(),
      ...data
    };

    try {
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`;
      }

      const response = await fetch(`${this.apiUrl}/analyze`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      
      // Trigger callback if high risk
      if (result.level === 'HIGH' && this.onHighRisk) {
        this.onHighRisk(result, payload);
      }
      
      return result;
    } catch (error) {
      console.error('❌ Risk SDK: Analysis failed', error);
      throw error;
    }
  }

  /**
   * Calculate API calls per minute
   */
  calculateApiRate() {
    const oneMinuteAgo = Date.now() - 60000;
    const recentCalls = this.sessionData.requests.filter(r => r.time > oneMinuteAgo);
    return recentCalls.length;
  }

  /**
   * Count repeated requests to same endpoint
   */
  getRepeatedRequestCount() {
    const urlCounts = {};
    this.sessionData.requests.forEach(r => {
      urlCounts[r.url] = (urlCounts[r.url] || 0) + 1;
    });
    return Math.max(...Object.values(urlCounts), 0);
  }

  /**
   * Check for unusual endpoint access patterns
   */
  checkUnusualEndpoints() {
    const sensitivePatterns = ['admin', 'config', 'api/internal', 'debug'];
    const unusual = this.sessionData.requests.filter(r => {
      return sensitivePatterns.some(pattern => r.url.includes(pattern));
    });
    return unusual.length;
  }

  /**
   * Get current session report
   */
  getSessionReport() {
    return {
      ...this.sessionData,
      duration: Date.now() - this.sessionData.startTime,
      apiRate: this.calculateApiRate(),
      repeatedRequests: this.getRepeatedRequestCount(),
      unusualAccess: this.checkUnusualEndpoints()
    };
  }
}

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RiskScoreSDK;
}

if (typeof window !== 'undefined') {
  window.RiskScoreSDK = RiskScoreSDK;
}
