import React, { useState } from 'react';
import axios from 'axios';
import { Send, Loader2, AlertCircle, CheckCircle, Shield, MapPin, DollarSign, Activity, Key, Server } from 'lucide-react';
import RiskMeter from '../components/RiskMeter';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const InputForm = () => {
  const [formData, setFormData] = useState({
    loginTime: '',
    failAttempts: '',
    locationChange: '0',
    txnAmount: '',
    apiCallsPerMinute: '',
    repeatedRequests: '',
    unusualEndpointAccess: '0',
    passwordResetAttempts: '',
    otpFailures: '',
    multipleAccountsTried: '0'
  });
  const [activeSection, setActiveSection] = useState('all');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const payload = {
        loginTime: parseInt(formData.loginTime) || 0,
        failAttempts: parseInt(formData.failAttempts) || 0,
        locationChange: parseInt(formData.locationChange) || 0,
        txnAmount: parseFloat(formData.txnAmount) || 0,
        apiCallsPerMinute: parseInt(formData.apiCallsPerMinute) || 0,
        repeatedRequests: parseInt(formData.repeatedRequests) || 0,
        unusualEndpointAccess: parseInt(formData.unusualEndpointAccess) || 0,
        passwordResetAttempts: parseInt(formData.passwordResetAttempts) || 0,
        otpFailures: parseInt(formData.otpFailures) || 0,
        multipleAccountsTried: parseInt(formData.multipleAccountsTried) || 0
      };

      const response = await axios.post(`${API_URL}/analyze`, payload);
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to analyze risk. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      loginTime: '',
      failAttempts: '',
      locationChange: '0',
      txnAmount: '',
      apiCallsPerMinute: '',
      repeatedRequests: '',
      unusualEndpointAccess: '0',
      passwordResetAttempts: '',
      otpFailures: '',
      multipleAccountsTried: '0'
    });
    setResult(null);
    setError('');
  };

  return (
    <div className="container">
      <div className="page-header">
        <h2>Analyze User Behavior</h2>
        <p>Enter user activity data to calculate risk score</p>
      </div>

      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        marginBottom: '24px',
        flexWrap: 'wrap',
        padding: '12px',
        background: 'rgba(15, 23, 42, 0.3)',
        borderRadius: '12px'
      }}>
        {[
          { id: 'all', label: 'All Behaviors', icon: Activity },
          { id: 'auth', label: 'Authentication', icon: Shield },
          { id: 'geo', label: 'Geographic', icon: MapPin },
          { id: 'txn', label: 'Transaction', icon: DollarSign },
          { id: 'api', label: 'API/Request', icon: Server },
          { id: 'cred', label: 'Credential', icon: Key }
        ].map(section => {
          const Icon = section.icon;
          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 16px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                background: activeSection === section.id ? '#3b82f6' : 'rgba(59, 130, 246, 0.1)',
                color: activeSection === section.id ? '#fff' : '#94a3b8',
                fontWeight: '500',
                transition: 'all 0.2s',
                fontSize: '0.9rem'
              }}
            >
              <Icon size={16} />
              {section.label}
            </button>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: result ? '1fr 1fr' : '1fr', gap: '24px' }}>
        <div className="card" style={{ padding: '24px' }}>
          <form onSubmit={handleSubmit}>
            
            {/* 1. Authentication Behavior Section */}
            {(activeSection === 'all' || activeSection === 'auth') && (
              <div style={{ marginBottom: '28px' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '10px',
                  marginBottom: '12px',
                  paddingBottom: '12px',
                  borderBottom: '1px solid rgba(59, 130, 246, 0.3)'
                }}>
                  <Shield size={22} style={{ color: '#3b82f6' }} />
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#3b82f6' }}>🔐 Authentication Behavior</h3>
                </div>
                <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '16px' }}>
                  Tracks login patterns and failed authentication attempts
                </p>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Login Time (Hour 0-23)</label>
                    <input
                      type="number"
                      name="loginTime"
                      className="form-input"
                      placeholder="e.g., 14 for 2 PM"
                      min="0"
                      max="23"
                      value={formData.loginTime}
                      onChange={handleChange}
                    />
                    <small style={{ color: '#64748b', fontSize: '0.75rem', display: 'block', marginTop: '4px' }}>
                      Late night (3-5 AM) = Higher risk
                    </small>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Failed Login Attempts</label>
                    <input
                      type="number"
                      name="failAttempts"
                      className="form-input"
                      placeholder="0-20"
                      min="0"
                      max="20"
                      value={formData.failAttempts}
                      onChange={handleChange}
                    />
                    <small style={{ color: '#64748b', fontSize: '0.75rem', display: 'block', marginTop: '4px' }}>
                      Multiple failures = Brute force attack
                    </small>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Geographic Behavior Section */}
            {(activeSection === 'all' || activeSection === 'geo') && (
              <div style={{ marginBottom: '28px' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '10px',
                  marginBottom: '12px',
                  paddingBottom: '12px',
                  borderBottom: '1px solid rgba(34, 197, 94, 0.3)'
                }}>
                  <MapPin size={22} style={{ color: '#22c55e' }} />
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#22c55e' }}>📍 Geographic Behavior</h3>
                </div>
                <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '16px' }}>
                  Detects location changes that may indicate account takeover
                </p>

                <div className="form-group" style={{ maxWidth: '300px' }}>
                  <label className="form-label">Location Change</label>
                  <select
                    name="locationChange"
                    className="form-input"
                    value={formData.locationChange}
                    onChange={handleChange}
                  >
                    <option value="0">No - Same location as usual</option>
                    <option value="1">Yes - Different city/country</option>
                  </select>
                  <small style={{ color: '#64748b', fontSize: '0.75rem', display: 'block', marginTop: '4px' }}>
                    Sudden location jump = Suspicious activity
                  </small>
                </div>
              </div>
            )}

            {/* 3. Transaction Behavior Section */}
            {(activeSection === 'all' || activeSection === 'txn') && (
              <div style={{ marginBottom: '28px' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '10px',
                  marginBottom: '12px',
                  paddingBottom: '12px',
                  borderBottom: '1px solid rgba(245, 158, 11, 0.3)'
                }}>
                  <DollarSign size={22} style={{ color: '#f59e0b' }} />
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#f59e0b' }}>💰 Transaction Behavior</h3>
                </div>
                <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '16px' }}>
                  Analyzes transaction amounts for unusual spending patterns
                </p>

                <div className="form-group" style={{ maxWidth: '300px' }}>
                  <label className="form-label">Transaction Amount ($)</label>
                  <input
                    type="number"
                    name="txnAmount"
                    className="form-input"
                    placeholder="e.g., 5000"
                    min="0"
                    step="0.01"
                    value={formData.txnAmount}
                    onChange={handleChange}
                  />
                  <small style={{ color: '#64748b', fontSize: '0.75rem', display: 'block', marginTop: '4px' }}>
                    High amounts = Higher impact if fraudulent
                  </small>
                </div>
              </div>
            )}

            {/* 4. API/Request Behavior Section */}
            {(activeSection === 'all' || activeSection === 'api') && (
              <div style={{ marginBottom: '28px' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '10px',
                  marginBottom: '12px',
                  paddingBottom: '12px',
                  borderBottom: '1px solid rgba(139, 92, 246, 0.3)'
                }}>
                  <Server size={22} style={{ color: '#8b5cf6' }} />
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#8b5cf6' }}>🔡 API / Request Behavior</h3>
                </div>
                <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '16px' }}>
                  Detects bots, DDoS attacks, and automated threats
                </p>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">API Calls Per Minute</label>
                    <input
                      type="number"
                      name="apiCallsPerMinute"
                      className="form-input"
                      placeholder="e.g., 120"
                      min="0"
                      value={formData.apiCallsPerMinute}
                      onChange={handleChange}
                    />
                    <small style={{ color: '#64748b', fontSize: '0.75rem', display: 'block', marginTop: '4px' }}>
                      {'>'}100/min = Bot/DDoS attack
                    </small>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Repeated Requests</label>
                    <input
                      type="number"
                      name="repeatedRequests"
                      className="form-input"
                      placeholder="e.g., 5"
                      min="0"
                      value={formData.repeatedRequests}
                      onChange={handleChange}
                    />
                    <small style={{ color: '#64748b', fontSize: '0.75rem', display: 'block', marginTop: '4px' }}>
                      Same endpoint hit repeatedly
                    </small>
                  </div>
                </div>

                <div className="form-group" style={{ maxWidth: '300px', marginTop: '12px' }}>
                  <label className="form-label">Unusual Endpoint Access</label>
                  <select
                    name="unusualEndpointAccess"
                    className="form-input"
                    value={formData.unusualEndpointAccess}
                    onChange={handleChange}
                  >
                    <option value="0">No - Normal endpoints only</option>
                    <option value="1">Yes - Accessed /admin, /config, etc.</option>
                  </select>
                  <small style={{ color: '#64748b', fontSize: '0.75rem', display: 'block', marginTop: '4px' }}>
                    Accessing admin endpoints = Privilege escalation
                  </small>
                </div>
              </div>
            )}

            {/* 5. Credential Behavior Section */}
            {(activeSection === 'all' || activeSection === 'cred') && (
              <div style={{ marginBottom: '28px' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '10px',
                  marginBottom: '12px',
                  paddingBottom: '12px',
                  borderBottom: '1px solid rgba(239, 68, 68, 0.3)'
                }}>
                  <Key size={22} style={{ color: '#ef4444' }} />
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#ef4444' }}>🔑 Credential Behavior</h3>
                </div>
                <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '16px' }}>
                  Tracks password resets, OTP failures, and account enumeration
                </p>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Password Reset Attempts</label>
                    <input
                      type="number"
                      name="passwordResetAttempts"
                      className="form-input"
                      placeholder="0-10"
                      min="0"
                      max="10"
                      value={formData.passwordResetAttempts}
                      onChange={handleChange}
                    />
                    <small style={{ color: '#64748b', fontSize: '0.75rem', display: 'block', marginTop: '4px' }}>
                      Multiple resets = Account takeover
                    </small>
                  </div>

                  <div className="form-group">
                    <label className="form-label">OTP Failures</label>
                    <input
                      type="number"
                      name="otpFailures"
                      className="form-input"
                      placeholder="0-10"
                      min="0"
                      max="10"
                      value={formData.otpFailures}
                      onChange={handleChange}
                    />
                    <small style={{ color: '#64748b', fontSize: '0.75rem', display: 'block', marginTop: '4px' }}>
                      Wrong OTP entered multiple times
                    </small>
                  </div>
                </div>

                <div className="form-group" style={{ maxWidth: '300px', marginTop: '12px' }}>
                  <label className="form-label">Multiple Accounts Tried</label>
                  <select
                    name="multipleAccountsTried"
                    className="form-input"
                    value={formData.multipleAccountsTried}
                    onChange={handleChange}
                  >
                    <option value="0">No - Single account</option>
                    <option value="1">Yes - Tried multiple usernames</option>
                  </select>
                  <small style={{ color: '#64748b', fontSize: '0.75rem', display: 'block', marginTop: '4px' }}>
                    Username enumeration attack
                  </small>
                </div>
              </div>
            )}

            {error && (
              <div className="error-message">
                <AlertCircle size={20} />
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', marginTop: '30px', paddingTop: '20px', borderTop: '1px solid rgba(148, 163, 184, 0.2)' }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <Loader2 size={20} className="spinner-small" /> : <Send size={20} />}
                {loading ? 'Analyzing...' : 'Analyze Risk'}
              </button>
              {result && (
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Reset All
                </button>
              )}
            </div>
          </form>
        </div>

        {result && (
          <div className="card">
            <div className="card-header">
              <CheckCircle size={22} style={{ color: '#22c55e' }} />
              <h3>Risk Assessment Result</h3>
            </div>

            <RiskMeter score={result.risk} level={result.level} />

            <div style={{ marginTop: '30px' }}>
              <h4 style={{ marginBottom: '16px', color: '#94a3b8' }}>📊 Behavior Analysis Summary</h4>
              
              {/* Authentication */}
              {(formData.loginTime || formData.failAttempts) && (
                <div style={{ marginBottom: '16px' }}>
                  <h5 style={{ color: '#3b82f6', fontSize: '0.9rem', marginBottom: '8px' }}>🔐 Authentication</h5>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {formData.loginTime && (
                      <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '10px', borderRadius: '8px' }}>
                        <span style={{ color: '#64748b', fontSize: '0.8rem' }}>Login Time</span>
                        <p style={{ fontWeight: '600', marginTop: '4px', color: '#3b82f6' }}>{formData.loginTime}:00</p>
                      </div>
                    )}
                    {formData.failAttempts && (
                      <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '8px' }}>
                        <span style={{ color: '#64748b', fontSize: '0.8rem' }}>Failed Attempts</span>
                        <p style={{ fontWeight: '600', marginTop: '4px', color: '#ef4444' }}>{formData.failAttempts}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Geographic */}
              {formData.locationChange === '1' && (
                <div style={{ marginBottom: '16px' }}>
                  <h5 style={{ color: '#22c55e', fontSize: '0.9rem', marginBottom: '8px' }}>📍 Geographic</h5>
                  <div style={{ background: 'rgba(239, 68, 68, 0.2)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                    <span style={{ color: '#ef4444', fontSize: '0.8rem' }}>⚠️ Location Changed</span>
                    <p style={{ fontWeight: '600', marginTop: '4px', color: '#ef4444' }}>YES - Different Location</p>
                  </div>
                </div>
              )}

              {/* Transaction */}
              {formData.txnAmount && (
                <div style={{ marginBottom: '16px' }}>
                  <h5 style={{ color: '#f59e0b', fontSize: '0.9rem', marginBottom: '8px' }}>💰 Transaction</h5>
                  <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '10px', borderRadius: '8px' }}>
                    <span style={{ color: '#64748b', fontSize: '0.8rem' }}>Amount</span>
                    <p style={{ fontWeight: '600', marginTop: '4px', color: '#f59e0b' }}>${formData.txnAmount}</p>
                  </div>
                </div>
              )}

              {/* API Behavior */}
              {(formData.apiCallsPerMinute || formData.repeatedRequests || formData.unusualEndpointAccess === '1') && (
                <div style={{ marginBottom: '16px' }}>
                  <h5 style={{ color: '#8b5cf6', fontSize: '0.9rem', marginBottom: '8px' }}>🔡 API/Request</h5>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {formData.apiCallsPerMinute && (
                      <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '10px', borderRadius: '8px' }}>
                        <span style={{ color: '#64748b', fontSize: '0.8rem' }}>API Calls/Min</span>
                        <p style={{ fontWeight: '600', marginTop: '4px', color: '#8b5cf6' }}>{formData.apiCallsPerMinute}</p>
                      </div>
                    )}
                    {formData.repeatedRequests && (
                      <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '8px' }}>
                        <span style={{ color: '#64748b', fontSize: '0.8rem' }}>Repeated Requests</span>
                        <p style={{ fontWeight: '600', marginTop: '4px', color: '#ef4444' }}>{formData.repeatedRequests}</p>
                      </div>
                    )}
                  </div>
                  {formData.unusualEndpointAccess === '1' && (
                    <div style={{ background: 'rgba(239, 68, 68, 0.2)', padding: '10px', borderRadius: '8px', marginTop: '8px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                      <span style={{ color: '#ef4444', fontSize: '0.8rem' }}>⚠️ Unusual Endpoint Access</span>
                      <p style={{ fontWeight: '600', marginTop: '4px', color: '#ef4444' }}>YES - Admin/Config Accessed</p>
                    </div>
                  )}
                </div>
              )}

              {/* Credential */}
              {(formData.passwordResetAttempts || formData.otpFailures || formData.multipleAccountsTried === '1') && (
                <div style={{ marginBottom: '16px' }}>
                  <h5 style={{ color: '#ef4444', fontSize: '0.9rem', marginBottom: '8px' }}>🔑 Credential</h5>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {formData.passwordResetAttempts && (
                      <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '8px' }}>
                        <span style={{ color: '#64748b', fontSize: '0.8rem' }}>Reset Attempts</span>
                        <p style={{ fontWeight: '600', marginTop: '4px', color: '#ef4444' }}>{formData.passwordResetAttempts}</p>
                      </div>
                    )}
                    {formData.otpFailures && (
                      <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '8px' }}>
                        <span style={{ color: '#64748b', fontSize: '0.8rem' }}>OTP Failures</span>
                        <p style={{ fontWeight: '600', marginTop: '4px', color: '#ef4444' }}>{formData.otpFailures}</p>
                      </div>
                    )}
                  </div>
                  {formData.multipleAccountsTried === '1' && (
                    <div style={{ background: 'rgba(239, 68, 68, 0.2)', padding: '10px', borderRadius: '8px', marginTop: '8px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                      <span style={{ color: '#ef4444', fontSize: '0.8rem' }}>⚠️ Multiple Accounts Tried</span>
                      <p style={{ fontWeight: '600', marginTop: '4px', color: '#ef4444' }}>YES - Enumeration Attack</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InputForm;
