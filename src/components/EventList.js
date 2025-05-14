// src/components/EventsList.js
import React, { useEffect, useState } from 'react';
import { fetchEvents } from '../services/EventService';

function EventsList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const data = await fetchEvents('ai', 'Hyderabad');
        setEvents(data);    
      } catch (err) {
        console.error('❌ Error fetching events from backend:', error.response?.data || error.message);
        setError('Failed to fetch events.');
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  return (
    <div>
      <h2>Upcoming Events</h2>
      {loading ? (
        <p>Loading events...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : events.length === 0 ? (
        <p>No events found.</p>
      ) : (
        <ul>
          {events.map((event) => (
            <li key={event.id}>
              <strong>{event.name}</strong><br />
              {event.date}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default EventsList;
