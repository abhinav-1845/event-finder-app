import React, { useState, useEffect } from 'react';
import './Favorites.css';

function Favorites() {
  const userEmail = localStorage.getItem('userEmail') || 'guest';
  const [favorites, setFavorites] = useState(() => 
    JSON.parse(localStorage.getItem(`favorites_${userEmail}`)) || []
  );

  useEffect(() => {
    localStorage.setItem(`favorites_${userEmail}`, JSON.stringify(favorites));
  }, [favorites, userEmail]);

  const removeFavorite = (indexToRemove) => {
    const updatedFavorites = favorites.filter((_, index) => index !== indexToRemove);
    setFavorites(updatedFavorites);
  };

  return (
    <div className="favorites-wrapper">
      <header className="favorites-header">
        <h1>⭐ Your Favorite Events</h1>
      </header>
      <div className="favorites-content">
        {favorites.length === 0 ? (
          <p className="no-favorites">No favorite events yet. Add some from the Home page!</p>
        ) : (
          <div className="events-grid">
            {favorites.map((event, index) => (
              <div key={event.title + index} className="event-card">
                <h2>{event.title}</h2>
                <p><strong>Venue:</strong> {event.venue?.name || event.address?.join(', ') || 'Not specified'}</p>
                <p><strong>Time:</strong> {event.date?.when || 'Not specified'}</p>
                <p><strong>Description:</strong> {event.description || 'No description'}</p>
                <div className="event-actions">
                  {event.link && (
                    <a href={event.link} target="_blank" rel="noopener noreferrer" className="more-info-btn">
                      More Info
                    </a>
                  )}
                  <button className="remove-btn" onClick={() => removeFavorite(index)}>
                    🗑️ Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Favorites;