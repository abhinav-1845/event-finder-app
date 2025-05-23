import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';
import './Dashboard.css';

function Dashboard() {
  const [userData, setUserData] = useState(null);
  const [favoriteEvents, setFavoriteEvents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    if (!email) {
      navigate('/login');
    } else {
      const profile = JSON.parse(localStorage.getItem('profileData')) || {};
      setUserData({ email, ...profile });
      const favorites = JSON.parse(localStorage.getItem(`favorites_${email}`)) || [];
      setFavoriteEvents(favorites);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('profileData');
    navigate('/login');
  };

  return (
    <div className="dashboard-wrapper">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h2>🎉 EventFinder</h2>
        </div>
        <nav className="sidebar-nav">
          <ul>
            <li className="active"><span>📊</span> Dashboard</li>
            <li onClick={() => navigate('/profile')}><span>👤</span> Profile</li>
            <li onClick={() => navigate('/favorites')}><span>⭐</span> Favorites</li>
            <li onClick={() => navigate('/settings')}><span>⚙️</span> Settings</li>
          </ul>
        </nav>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <h1>📊 Welcome, {userData?.name || 'User'}!</h1>
          <div className="header-actions">
            <button className="go-home-btn" onClick={() => navigate('/')}>
              🏠 Home
            </button>
            <button className="logout-btn" onClick={handleLogout}>
              🚪 Logout
            </button>
          </div>
        </header>

        <div className="dashboard-content">
          <div className="profile-card">
            <div className="profile-image">
              {userData?.image ? (
                <img src={userData.image} alt="Profile" className="profile-img" />
              ) : (
                <FaUserCircle className="profile-icon" />
              )}
            </div>
            <h2>👤 {userData?.name || 'User'}</h2>
            <p><strong>Email:</strong> {userData?.email}</p>
            {userData?.phone && <p><strong>Phone:</strong> {userData.phone}</p>}
            {userData?.job && <p><strong>Job:</strong> {userData.job}</p>}
            {userData?.gender && <p><strong>Gender:</strong> {userData.gender}</p>}
            {userData?.interests && <p><strong>Interests:</strong> {userData.interests}</p>}
          </div>

          <div className="events-section">
            <h3>Your Favorite Events</h3>
            <div className="events-grid">
              {favoriteEvents.length > 0 ? (
                favoriteEvents.map((event, index) => (
                  <div key={event.title + index} className="event-card">
                    <h4>{event.title}</h4>
                    <p><strong>Time:</strong> {event.date?.when || 'Not specified'}</p>
                    <p><strong>Venue:</strong> {event.venue?.name || event.address?.join(', ') || 'Not specified'}</p>
                    <button
                      className="view-event-btn"
                      onClick={() => event.link && window.open(event.link, '_blank')}
                    >
                      View Details
                    </button>
                  </div>
                ))
              ) : (
                <p>No favorite events yet. Add some from the Home page!</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;