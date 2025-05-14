// src/pages/PlanDay.js
import React, { useState } from 'react';
import './PlanDay.css';
import { useLocation } from 'react-router-dom';

const PlanDay = () => {
  const location = useLocation();
  const { selectedEvents = [] } = location.state || {}; // Get events from route state

  const [selected, setSelected] = useState([...selectedEvents]);

  // If no events were passed, show a message
  const hasEvents = selectedEvents.length > 0;

  const handleSelectEvent = (event) => {
    if (!selected.some(e => e.id === event.id)) {
      setSelected([...selected, event]);
    }
  };

  const removeEvent = (id) => {
    setSelected(selected.filter(event => event.id !== id));
  };

  return (
    <div className="plan-day-container">
      <h1>📅 Plan Your Day</h1>

      <section className="available-events-section">
        <h2>Available Events</h2>
        {hasEvents ? (
          <div className="events-grid">
            {selectedEvents.map(event => (
              <div
                key={event.id}
                className="event-card"
                onClick={() => handleSelectEvent(event)}
              >
                <h3>{event.name}</h3>
                <p>{event.time}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>No events available to plan. Go back and search for events first.</p>
        )}
      </section>

      <section className="selected-events-section">
        <h2>Your Selected Events</h2>
        {selected.length > 0 ? (
          <ul className="selected-list">
            {selected
              .sort((a, b) => a.time.localeCompare(b.time))
              .map(event => (
                <li key={event.id} className="selected-item">
                  <span>
                    {event.name} - {event.time}
                  </span>
                  <button onClick={() => removeEvent(event.id)} className="remove-btn">
                    Remove
                  </button>
                </li>
              ))
            }
          </ul>
        ) : (
          <p>No events selected yet.</p>
        )}
      </section>
    </div>
  );
};

export default PlanDay;