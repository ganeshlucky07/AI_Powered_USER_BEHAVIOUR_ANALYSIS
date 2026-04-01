/**
 * React Hook for Risk Score Integration
 * useRiskScore - Track and analyze user behavior in React apps
 */

import { useState, useEffect, useCallback, useRef } from 'react';

const useRiskScore = (config = {}) => {
  const {
    apiUrl = 'http://localhost:8080/api',
    token = null,
    autoTrack = true,
    onHighRisk = null,
    onAnalysisComplete = null
  } = config;

  const [riskScore, setRiskScore] = useState(null);
  const [riskLevel, setRiskLevel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sessionData, setSessionData] = useState({
    loginTime: new Date().getHours(),
    failedAttempts: 0,
    locationChange: false,
    apiCalls: 0,
    requests: [],
    startTime: Date.now()
  });

  const sessionRef = useRef(sessionData);

  // Update ref when state changes
  useEffect(() => {
    sessionRef.current = sessionData;
  }, [sessionData]);

  // Start tracking on mount
  useEffect(() => {
    if (!autoTrack) return;

    // Track geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          updateSession({
            lastLocation: {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude
            }
          });
        },
        () => {
          updateSession({ locationChange: true });
        }
      );
    }

    // Intercept fetch to track API calls
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      trackApiCall(args[0]);
      return originalFetch.apply(window, args);
    };

    // Track user interactions
    const handleClick = (e) => {
      const target = e.target;
      if (target.tagName === 'INPUT' && target.type === 'password') {
        // Track password field interactions
        trackBehavior('passwordInteraction');
      }
    };

    document.addEventListener('click', handleClick);

    return () => {
      window.fetch = originalFetch;
      document.removeEventListener('click', handleClick);
    };
  }, [autoTrack]);

  const updateSession = (updates) => {
    setSessionData(prev => ({ ...prev, ...updates }));
  };

  const trackApiCall = (url) => {
    const current = sessionRef.current;
    const newRequests = [...current.requests, { url, time: Date.now() }];
    
    updateSession({
      apiCalls: current.apiCalls + 1,
      requests: newRequests
    });
  };

  const trackBehavior = (action) => {
    if (action === 'failedLogin') {
      updateSession({
        failedAttempts: sessionRef.current.failedAttempts + 1
      });
    }
  };

  const analyze = useCallback(async (customData = {}) => {
    setLoading(true);
    setError(null);

    const current = sessionRef.current;
    
    // Calculate metrics
    const oneMinuteAgo = Date.now() - 60000;
    const recentRequests = current.requests.filter(r => r.time > oneMinuteAgo);
    
    const urlCounts = {};
    current.requests.forEach(r => {
      urlCounts[r.url] = (urlCounts[r.url] || 0) + 1;
    });
    const maxRepeated = Math.max(...Object.values(urlCounts), 0);

    const payload = {
      loginTime: customData.loginTime || current.loginTime,
      failAttempts: customData.failAttempts || current.failedAttempts,
      locationChange: customData.locationChange !== undefined 
        ? customData.locationChange 
        : (current.locationChange ? 1 : 0),
      txnAmount: customData.txnAmount || 0,
      // Advanced metrics
      apiCallsPerMinute: recentRequests.length,
      repeatedRequests: maxRepeated,
      unusualEndpointAccess: current.requests.filter(r => 
        ['/admin', '/config'].some(p => r.url?.includes(p))
      ).length
    };

    try {
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${apiUrl}/analyze`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      setRiskScore(result.risk);
      setRiskLevel(result.level);

      if (result.level === 'HIGH' && onHighRisk) {
        onHighRisk(result, payload);
      }

      if (onAnalysisComplete) {
        onAnalysisComplete(result, payload);
      }

      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiUrl, token, onHighRisk, onAnalysisComplete]);

  const getSessionReport = () => {
    const current = sessionRef.current;
    return {
      ...current,
      duration: Date.now() - current.startTime,
      currentRiskScore: riskScore,
      currentRiskLevel: riskLevel
    };
  };

  return {
    riskScore,
    riskLevel,
    loading,
    error,
    analyze,
    trackBehavior,
    getSessionReport,
    sessionData
  };
};

export default useRiskScore;
