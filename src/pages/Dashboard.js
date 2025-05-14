// src/pages/Dashboard.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

function Dashboard() {
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    if (!email) {
      navigate('/login');
    } else {
      const profile = JSON.parse(localStorage.getItem('profileData')) || {};
      setUserData({ email, ...profile });
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('profileData');
    navigate('/login');
  };

  if (!userData) return <div className="loading">Loading...</div>;

  return (
    <div className="dashboard-wrapper">
      <header className="dashboard-header">
        <h1>📊 Dashboard</h1>
        <div className="header-actions">
          <button className="go-home-btn" onClick={() => navigate('/')}>
            🏠 Go to Home
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="profile-card">
          <div className="profile-image">
            <img
              src={userData.profilePic || 'https://via.placeholder.com/150'}
              alt="Profile"
              className="profile-img"
            />
          </div>
          <h2>👤 {userData.name || 'User'}</h2>
          <p><strong>Email:</strong> {userData.email}</p>
          {userData.phone && <p><strong>Phone:</strong> {userData.phone}</p>}
          {userData.job && <p><strong>Job:</strong> {userData.job}</p>}
          {userData.gender && <p><strong>Gender:</strong> {userData.gender}</p>}
          {userData.interests && <p><strong>Interests:</strong> {userData.interests}</p>}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;