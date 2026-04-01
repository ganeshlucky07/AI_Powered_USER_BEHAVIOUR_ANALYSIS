import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart3, TrendingUp, AlertTriangle, Users, 
  Loader2, AlertCircle, Search, Filter, Download, FileSpreadsheet, Calendar
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
);

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const Dashboard = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const response = await axios.get(`${API_URL}/all`);
      setActivities(response.data);
    } catch (err) {
      setError('Failed to load data from server');
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats
  const stats = {
    total: activities.length,
    low: activities.filter(a => a.riskLevel === 'LOW').length,
    medium: activities.filter(a => a.riskLevel === 'MEDIUM').length,
    high: activities.filter(a => a.riskLevel === 'HIGH').length
  };

  // Filter activities with date range
  const filteredActivities = activities.filter(a => {
    const matchesSearch = a.id?.toString().includes(searchTerm) || 
                          a.riskScore?.toString().includes(searchTerm);
    const matchesFilter = filterLevel === 'ALL' || a.riskLevel === filterLevel;
    
    let matchesDate = true;
    if (startDate && endDate && a.createdAt) {
      const activityDate = new Date(a.createdAt);
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59);
      matchesDate = activityDate >= start && activityDate <= end;
    }
    
    return matchesSearch && matchesFilter && matchesDate;
  });

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['ID', 'Login Time', 'Failed Attempts', 'Location Change', 'Transaction Amount', 'Risk Score', 'Risk Level', 'Timestamp'];
    const rows = filteredActivities.map(a => [
      a.id,
      a.loginTime,
      a.failAttempts,
      a.locationChange,
      a.txnAmount,
      a.riskScore,
      a.riskLevel,
      a.createdAt
    ]);
    
    const csvContent = [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `risk-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Chart data
  const barData = {
    labels: ['LOW', 'MEDIUM', 'HIGH'],
    datasets: [{
      label: 'Risk Distribution',
      data: [stats.low, stats.medium, stats.high],
      backgroundColor: [
        'rgba(34, 197, 94, 0.7)',
        'rgba(234, 179, 8, 0.7)',
        'rgba(239, 68, 68, 0.7)'
      ],
      borderColor: [
        'rgb(34, 197, 94)',
        'rgb(234, 179, 8)',
        'rgb(239, 68, 68)'
      ],
      borderWidth: 2,
      borderRadius: 8
    }]
  };

  const doughnutData = {
    labels: ['LOW', 'MEDIUM', 'HIGH'],
    datasets: [{
      data: [stats.low, stats.medium, stats.high],
      backgroundColor: [
        'rgba(34, 197, 94, 0.8)',
        'rgba(234, 179, 8, 0.8)',
        'rgba(239, 68, 68, 0.8)'
      ],
      borderColor: '#1e293b',
      borderWidth: 3
    }]
  };

  // Line chart - last 10 entries
  const recentActivities = activities.slice(0, 10).reverse();
  const lineData = {
    labels: recentActivities.map((_, i) => `#${i + 1}`),
    datasets: [{
      label: 'Risk Score Trend',
      data: recentActivities.map(a => a.riskScore),
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#3b82f6',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 5
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#94a3b8' }
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(148, 163, 184, 0.1)' },
        ticks: { color: '#94a3b8' }
      },
      y: {
        grid: { color: 'rgba(148, 163, 184, 0.1)' },
        ticks: { color: '#94a3b8' }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#94a3b8', padding: 20 }
      }
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading-container">
          <div className="spinner" />
          <p style={{ marginTop: '16px', color: '#94a3b8' }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <h2>Dashboard</h2>
        <p>Monitor risk scores and user activity patterns</p>
      </div>

      {error && (
        <div className="error-message">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {stats.high > 0 && (
        <div className="alert-banner">
          <AlertTriangle size={24} className="alert-icon" />
          <div>
            <strong>High Risk Alert!</strong> {stats.high} user(s) detected with HIGH risk score.
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value total">{stats.total}</div>
          <div className="stat-label">Total Records</div>
        </div>
        <div className="stat-card">
          <div className="stat-value low">{stats.low}</div>
          <div className="stat-label">Low Risk</div>
        </div>
        <div className="stat-card">
          <div className="stat-value medium">{stats.medium}</div>
          <div className="stat-label">Medium Risk</div>
        </div>
        <div className="stat-card">
          <div className="stat-value high">{stats.high}</div>
          <div className="stat-label">High Risk</div>
        </div>
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        <div className="card">
          <div className="card-header">
            <BarChart3 size={22} style={{ color: '#3b82f6' }} />
            <h3>Risk Distribution</h3>
          </div>
          <div className="chart-container">
            <Bar data={barData} options={chartOptions} />
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <TrendingUp size={22} style={{ color: '#8b5cf6' }} />
            <h3>Risk Score Trend</h3>
          </div>
          <div className="chart-container">
            <Line data={lineData} options={chartOptions} />
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <Users size={22} style={{ color: '#22c55e' }} />
            <h3>Risk Breakdown</h3>
          </div>
          <div className="chart-container">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="card-header">
          <Users size={22} style={{ color: '#3b82f6' }} />
          <h3>Activity Records</h3>
        </div>

        <div className="search-bar">
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              type="text"
              className="search-input"
              placeholder="Search by ID or score..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '40px' }}
            />
          </div>
          <div style={{ position: 'relative' }}>
            <Filter size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <select
              className="filter-select"
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              style={{ paddingLeft: '40px', minWidth: '150px' }}
            >
              <option value="ALL">All Levels</option>
              <option value="LOW">Low Risk</option>
              <option value="MEDIUM">Medium Risk</option>
              <option value="HIGH">High Risk</option>
            </select>
          </div>
        </div>

        <div className="search-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
            <Calendar size={18} style={{ color: '#64748b' }} />
            <input
              type="date"
              className="search-input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ maxWidth: '150px' }}
            />
            <span style={{ color: '#64748b' }}>to</span>
            <input
              type="date"
              className="search-input"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{ maxWidth: '150px' }}
            />
          </div>
          <button onClick={exportToCSV} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileSpreadsheet size={18} /> Export CSV
          </button>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Login Time</th>
                <th>Failed Attempts</th>
                <th>Location Change</th>
                <th>Transaction</th>
                <th>Risk Score</th>
                <th>Level</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {filteredActivities.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    No records found
                  </td>
                </tr>
              ) : (
                filteredActivities.map((activity) => (
                  <tr key={activity.id} className={activity.riskLevel === 'HIGH' ? 'high-risk' : ''}>
                    <td>#{activity.id}</td>
                    <td>{activity.loginTime}:00</td>
                    <td>{activity.failAttempts}</td>
                    <td>{activity.locationChange === 1 ? 'Yes' : 'No'}</td>
                    <td>${activity.txnAmount?.toFixed(2)}</td>
                    <td>
                      <span style={{
                        fontWeight: '600',
                        color: activity.riskLevel === 'HIGH' ? '#ef4444' : 
                               activity.riskLevel === 'MEDIUM' ? '#eab308' : '#22c55e'
                      }}>
                        {activity.riskScore}
                      </span>
                    </td>
                    <td>
                      <span className={`risk-level-badge ${activity.riskLevel?.toLowerCase()}`}>
                        {activity.riskLevel}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                      {formatDate(activity.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
