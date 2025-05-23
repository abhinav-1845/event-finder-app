import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';
import './Profile.css';

function Profile() {
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

  if (!userData) return <div className="loading">Loading...</div>;

  const interests = userData.interests ? userData.interests.split(',').map(i => i.trim()) : [];

  return (
    <div className="profile-wrapper">
      <header className="profile-header">
        <h1>👤 Your Profile</h1>
        <button className="edit-btn" onClick={() => navigate('/profile-setup')}>
          ✏️ Edit Profile
        </button>
      </header>

      <div className="profile-content">
        <div className="profile-card-3d">
          <div className="profile-card-inner">
            <div className="profile-image">
              {userData.image ? (
                <img src={userData.image} alt="Profile" className="profile-img" />
              ) : (
                <FaUserCircle className="profile-icon" />
              )}
            </div>
            <h2>{userData.name || 'User'}</h2>
            <div className="profile-details">
              <p><strong>Email:</strong> {userData.email}</p>
              {userData.phone && <p><strong>Phone:</strong> {userData.phone}</p>}
              {userData.job && <p><strong>Job:</strong> {userData.job}</p>}
              {userData.gender && <p><strong>Gender:</strong> {userData.gender}</p>}
            </div>
          </div>
        </div>

        <div className="interests-cloud">
          <h3>Your Interests</h3>
          <div className="tags">
            {interests.length > 0 ? (
              interests.map((interest, index) => (
                <span key={index} className="tag">
                  {interest}
                </span>
              ))
            ) : (
              <p>No interests added yet.</p>
            )}
          </div>
        </div>

        <div className="stats-section">
          <h3>Your Stats</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <h4>Favorite Events</h4>
              <p className="stat-number">5</p>
            </div>
            <div className="stat-card">
              <h4>Events Attended</h4>
              <p className="stat-number">3</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;