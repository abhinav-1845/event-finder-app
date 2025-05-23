import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Settings.css';

function Settings({ darkMode, toggleDarkMode }) {
  const navigate = useNavigate();
  const userEmail = localStorage.getItem('userEmail') || 'guest';

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('profileData');
    localStorage.removeItem(`favorites_${userEmail}`);
    navigate('/login');
  };

  const handleClearStorage = () => {
    if (window.confirm('Are you sure you want to clear all profile data? This cannot be undone.')) {
      localStorage.removeItem('profileData');
      localStorage.removeItem(`favorites_${userEmail}`);
      alert('Profile data and favorites cleared successfully.');
    }
  };

  const handleEditProfile = () => {
    navigate('/profile-setup');
  };

  return (
    <div className="settings-wrapper">
      <header className="settings-header">
        <h1>⚙️ Settings</h1>
        <button className="go-home-btn" onClick={() => navigate('/')}>
          🏠 Home
        </button>
      </header>

      <div className="settings-content">
        <div className="settings-card">
          <h2>Account Settings</h2>

          <div className="setting-section">
            <label htmlFor="theme-toggle">Theme</label>
            <button id="theme-toggle" className="toggle-btn" onClick={toggleDarkMode}>
              {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </button>
          </div>

          <div className="setting-section">
            <label>Notifications</label>
            <button className="toggle-btn" disabled>
              🔔 Coming Soon
            </button>
          </div>

          <div className="setting-section">
            <label>Profile</label>
            <button className="action-btn" onClick={handleEditProfile}>
              ✏️ Edit Profile
            </button>
          </div>

          <div className="setting-section">
            <label>Data</label>
            <button className="action-btn danger" onClick={handleClearStorage}>
              🗑️ Clear Data
            </button>
          </div>

          <div className="setting-section">
            <label>Session</label>
            <button className="action-btn logout" onClick={handleLogout}>
              🚪 Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;