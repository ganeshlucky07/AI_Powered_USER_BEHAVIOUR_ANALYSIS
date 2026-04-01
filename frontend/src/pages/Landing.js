import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, BarChart3, Zap, AlertTriangle, ArrowRight, Brain, Database, Activity } from 'lucide-react';

const Landing = () => {
  return (
    <div className="landing">
      <div className="landing-hero">
        <h2>AI-Powered User Behavior Risk Score Engine</h2>
        <p>
          Analyze user behavior patterns in real-time using machine learning. 
          Detect suspicious activities, calculate risk scores, and protect your platform from fraud.
        </p>
        <div className="landing-buttons">
          <Link to="/input" className="btn btn-primary">
            <Zap size={20} /> Analyze User
          </Link>
          <Link to="/dashboard" className="btn btn-secondary">
            <BarChart3 size={20} /> View Dashboard
          </Link>
        </div>
      </div>
      
      <div className="features-grid">
        <div className="feature-card">
          <div className="feature-icon">
            <Brain size={24} />
          </div>
          <h3>AI-Powered Analysis</h3>
          <p>RandomForest ML model trained on behavioral patterns to predict risk scores with high accuracy.</p>
        </div>
        
        <div className="feature-card">
          <div className="feature-icon">
            <Activity size={24} />
          </div>
          <h3>Real-Time Scoring</h3>
          <p>Instant risk assessment from 0-100 with LOW, MEDIUM, and HIGH classifications for quick decisions.</p>
        </div>
        
        <div className="feature-card">
          <div className="feature-icon">
            <AlertTriangle size={24} />
          </div>
          <h3>High-Risk Alerts</h3>
          <p>Automatic detection and highlighting of high-risk activities with visual alerts on the dashboard.</p>
        </div>
        
        <div className="feature-card">
          <div className="feature-icon">
            <Database size={24} />
          </div>
          <h3>Persistent Storage</h3>
          <p>All analysis records stored in MySQL database for historical tracking and trend analysis.</p>
        </div>
        
        <div className="feature-card">
          <div className="feature-icon">
            <BarChart3 size={24} />
          </div>
          <h3>Visual Dashboard</h3>
          <p>Interactive charts and tables with risk distribution, trends, and detailed activity logs.</p>
        </div>
        
        <div className="feature-card">
          <div className="feature-icon">
            <Shield size={24} />
          </div>
          <h3>Fallback Protection</h3>
          <p>Automatic formula-based scoring when AI service is unavailable ensures continuous operation.</p>
        </div>
      </div>
    </div>
  );
};

export default Landing;
