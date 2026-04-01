import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Lock, Save, AlertCircle, CheckCircle, Loader2, Mail, Shield } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const Profile = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await axios.put(`${API_URL}/auth/profile`, {
        fullName: formData.fullName,
        email: formData.email
      });
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await axios.put(`${API_URL}/auth/password`, {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
      setSuccess('Password changed successfully');
      setFormData({ ...formData, currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <h2>User Profile</h2>
        <p>Manage your account settings</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Profile Info Card */}
        <div className="card">
          <div className="card-header">
            <User size={22} style={{ color: '#3b82f6' }} />
            <h3>Profile Information</h3>
          </div>

          {error && (
            <div className="error-message">
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          {success && (
            <div className="success-message" style={{
              background: 'rgba(34, 197, 94, 0.15)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              borderRadius: '12px',
              padding: '16px 20px',
              color: '#86efac',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <CheckCircle size={20} />
              {success}
            </div>
          )}

          <form onSubmit={handleProfileUpdate}>
            <div className="form-group">
              <label className="form-label"><User size={16} /> Username</label>
              <input
                type="text"
                className="form-input"
                value={user?.username || ''}
                disabled
                style={{ opacity: 0.6 }}
              />
            </div>

            <div className="form-group">
              <label className="form-label"><Mail size={16} /> Email</label>
              <input
                type="email"
                name="email"
                className="form-input"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label"><User size={16} /> Full Name</label>
              <input
                type="text"
                name="fullName"
                className="form-input"
                value={formData.fullName}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label"><Shield size={16} /> Role</label>
              <input
                type="text"
                className="form-input"
                value={user?.role || 'USER'}
                disabled
                style={{ opacity: 0.6 }}
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <Loader2 size={20} className="spinner" /> : <Save size={20} />}
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="card">
          <div className="card-header">
            <Lock size={22} style={{ color: '#8b5cf6' }} />
            <h3>Change Password</h3>
          </div>

          <form onSubmit={handlePasswordChange}>
            <div className="form-group">
              <label className="form-label"><Lock size={16} /> Current Password</label>
              <input
                type="password"
                name="currentPassword"
                className="form-input"
                value={formData.currentPassword}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label"><Lock size={16} /> New Password</label>
              <input
                type="password"
                name="newPassword"
                className="form-input"
                value={formData.newPassword}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label"><Lock size={16} /> Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                className="form-input"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <Loader2 size={20} className="spinner" /> : <Lock size={20} />}
              {loading ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
