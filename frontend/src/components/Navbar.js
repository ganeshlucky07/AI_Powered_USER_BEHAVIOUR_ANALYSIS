import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Shield, Home, FormInput, LayoutDashboard, LogIn, UserPlus, LogOut, User, Settings, Sun, Moon } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  const isActive = (path) => location.pathname === path;
  
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <Shield size={28} />
        <h1>Risk Score Engine</h1>
      </Link>
      <div className="navbar-links">
        <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
          <Home size={18} /> Home
        </Link>
        
        <button onClick={toggleTheme} className="nav-link theme-toggle" title="Toggle Theme">
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        
        {isAuthenticated ? (
          <>
            <Link to="/input" className={`nav-link ${isActive('/input') ? 'active' : ''}`}>
              <FormInput size={18} /> Analyze
            </Link>
            <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>
              <LayoutDashboard size={18} /> Dashboard
            </Link>
            <Link to="/profile" className={`nav-link ${isActive('/profile') ? 'active' : ''}`}>
              <Settings size={18} /> Profile
            </Link>
            <div className="navbar-user">
              <User size={18} />
              <span>{user?.username}</span>
            </div>
            <button onClick={logout} className="nav-link logout-btn">
              <LogOut size={18} /> Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className={`nav-link ${isActive('/login') ? 'active' : ''}`}>
              <LogIn size={18} /> Login
            </Link>
            <Link to="/register" className={`nav-link ${isActive('/register') ? 'active' : ''}`}>
              <UserPlus size={18} /> Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
