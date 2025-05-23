import React, { useState } from 'react';
import { fetchEvents } from '../services/gptservices';

function EventsList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [keyword, setKeyword] = useState('ai');
  const [city, setCity] = useState('Hyderabad');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('');

  const handleSearch = async () => {
    if (!keyword.trim() || !city.trim()) {
      setError('Please enter both a keyword and a city');
      return;
    }

    setLoading(true);
    setError('');
    setEvents([]);

    try {
      const data = await fetchEvents(keyword, city, date, category);
      setEvents(data);
    } catch (err) {
      console.error('❌ Error fetching events:', err.message);
      setError(err.message || 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Upcoming Events</h2>
      {/* Search Form */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Keyword (e.g., music)"
          style={{ padding: '8px', flex: '1' }}
        />
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="City (e.g., Hyderabad)"
          style={{ padding: '8px', flex: '1' }}
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{ padding: '8px', flex: '1' }}
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{ padding: '8px', flex: '1' }}
        >
          <option value="">Select Category</option>
          <option value="concerts">Concerts</option>
          <option value="sports">Sports</option>
          <option value="theater">Theater</option>
          <option value="festivals">Festivals</option>
        </select>
        <button
          onClick={handleSearch}
          disabled={loading}
          style={{ padding: '8px 16px', background: '#007bff', color: 'white', border: 'none', cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? 'Searching...' : 'Search Events'}
        </button>
      </div>

      {/* Error, Loading, and Events Display */}
      {error && <p style={{ color: 'red', marginBottom: '20px' }}>{error}</p>}
      {loading && <p>Loading events...</p>}
      {!loading && !error && events.length === 0 && <p>No events found.</p>}
      {!loading && !error && events.length > 0 && (
        <ul style={{ listStyle: 'none', padding: '0' }}>
          {events.map((event, index) => (
            <li
              key={event.title + index}
              style={{ border: '1px solid #ddd', padding: '15px', marginBottom: '10px', borderRadius: '5px' }}
            >
              <strong style={{ fontSize: '1.2em' }}>{event.title || 'Untitled Event'}</strong>
              <p><strong>Date:</strong> {event.date?.when || 'Not specified'}</p>
              <p><strong>Location:</strong> {event.address?.join(', ') || 'Not specified'}</p>
              <p><strong>Description:</strong> {event.description || 'No description available'}</p>
              {event.venue && (
                <p>
                  <strong>Venue:</strong> {event.venue.name} {event.venue.rating && `(${event.venue.rating}/5, ${event.venue.reviews} reviews)`}
                </p>
              )}
              {event.ticket_info && event.ticket_info.length > 0 && (
                <div>
                  <strong>Tickets:</strong>
                  <ul style={{ paddingLeft: '20px' }}>
                    {event.ticket_info.map((ticket, idx) => (
                      <li key={idx}>
                        <a href={ticket.link} target="_blank" rel="noopener noreferrer">
                          {ticket.source}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {event.thumbnail && (
                <img
                  src={event.thumbnail}
                  alt={event.title}
                  style={{ maxWidth: '100px', marginTop: '10px' }}
                />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default EventsList;