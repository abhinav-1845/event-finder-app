import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import {
  FaList,
  FaThLarge,
  FaMap,
  FaUserCircle,
  FaCog,
  FaBell,
  FaShareAlt,
  FaChartLine,
  FaMusic,
  FaFootballBall,
  FaUtensils,
  FaLaptopCode,
  FaQuestionCircle,
  FaComment,
  FaHeart,
  FaBookmark,
  FaCalendarAlt,
  
} from 'react-icons/fa';
import { MdLocationOn } from 'react-icons/md';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Calendar from 'react-calendar';
import { DarkModeProvider } from './context/DarkModeContext';
import { UserProvider } from './context/UserContext';
import LoginPage from './pages/LoginPage';
import Favorites from './pages/Favorites';
import Profile from './pages/Profile';
import SignupPage from './pages/SignupPage';
import ProfileSetup from './pages/ProfileSetup';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import './App.css';
import { fetchEvents } from './services/gptService';

// Fix Leaflet default marker icon issue and set custom marker
const customMarkerIcon = new L.Icon({
  iconUrl: '/leaflet/marker-icon.png',
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  shadowUrl: '/leaflet/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Geocode city or venue using Nominatim
const geocodeLocation = async (query) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`
    );
    const data = await response.json();
    if (data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
      };
    }
    return null;
  } catch (error) {
    console.error('Error geocoding location:', error);
    return null;
  }
};

// Component to handle map zooming
function MapController({ center, events, zoomToUser }) {
  const map = useMap();

  useEffect(() => {
    if (zoomToUser && center && center.latitude && center.longitude) {
      map.flyTo([center.latitude, center.longitude], 15, { duration: 1 });
    }
  }, [zoomToUser, center, map]);

  useEffect(() => {
    if (events.length > 0 && center && center.latitude && center.longitude) {
      const validMarkers = events
        .filter((e) => e.latitude && e.longitude)
        .map((e) => [e.latitude, e.longitude]);
      const allPoints = [...validMarkers, [center.latitude, center.longitude]];
      if (allPoints.length > 1) {
        const bounds = L.latLngBounds(allPoints);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      } else if (allPoints.length === 1) {
        map.setView(allPoints[0], 15);
      }
    }
  }, [events, center, map]);

  return null;
}

function MapView({ events, center, zoomToUser }) {
  const defaultCenter = [17.3850, 78.4867]; // Hyderabad
  const mapCenter = center && center.latitude && center.longitude
    ? [center.latitude, center.longitude]
    : defaultCenter;

  return (
    <MapContainer center={mapCenter} zoom={13} className="leaflet-container">
      <TileLayer
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapController center={center} events={events} zoomToUser={zoomToUser} />
      {events.map((event, index) => {
        const position = event.latitude && event.longitude
          ? [event.latitude, event.longitude]
          : mapCenter;
        return (
          <Marker key={event.title + index} position={position} icon={customMarkerIcon}>
            <Popup>
              <div>
                <h3>{event.title}</h3>
                <p>{event.venue?.name || event.address?.join(', ') || 'Not specified'}</p>
                <p>{event.date?.when || 'Not specified'}</p>
                {event.link && (
                  <a href={event.link} target="_blank" rel="noopener noreferrer">
                    More Info
                  </a>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
function Home({ darkMode, toggleDarkMode }) {
  const [viewMode, setViewMode] = useState('grid');
  const [location, setLocation] = useState(null);
  const [events, setEvents] = useState(JSON.parse(localStorage.getItem('events')) || []);
  const [query, setQuery] = useState('');
  const [keyword, setKeyword] = useState(localStorage.getItem('keyword') || '');
  const [city, setCity] = useState(localStorage.getItem('city') || '');
  const [date, setDate] = useState(localStorage.getItem('date') || '');
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [zoomToUser, setZoomToUser] = useState(false);
  const [savedEvents, setSavedEvents] = useState(() => {
    const userEmail = localStorage.getItem('userEmail') || 'guest';
    return JSON.parse(localStorage.getItem(`savedEvents_${userEmail}`)) || [];
  });
  const [favorites, setFavorites] = useState(() => {
    const userEmail = localStorage.getItem('userEmail') || 'guest';
    return JSON.parse(localStorage.getItem(`favorites_${userEmail}`)) || [];
  });
  const [loading, setLoading] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const loadingMessages = [
    `Searching for "${keyword || 'events'}" in ${city || 'your area'}...`,
    `Finding the best events for you!`,
    `Almost there, curating your events...`,
  ];

  const getCategory = () => {
    const searchKeyword = keyword.toLowerCase().trim();
    if (searchKeyword.includes('music') || searchKeyword.includes('concert')) return 'Music';
    if (searchKeyword.includes('sport') || searchKeyword.includes('game') || searchKeyword.includes('vs')) return 'Sports';
    if (searchKeyword.includes('tech') || searchKeyword.includes('conference')) return 'Tech';
    if (searchKeyword.includes('food') || searchKeyword.includes('culinary')) return 'Food';
    return 'Other';
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Music': return <FaMusic />;
      case 'Sports': return <FaFootballBall />;
      case 'Food': return <FaUtensils />;
      case 'Tech': return <FaLaptopCode />;
      default: return <FaQuestionCircle />;
    }
  };

  const parseQuery = (query) => {
    const q = query.toLowerCase().trim();
    let parsedKeyword = '';
    let parsedCity = '';
    let parsedDate = '';

    const inMatch = q.match(/ in ([\w\s]+)( on|$)/);
    if (inMatch) {
      parsedCity = inMatch[1].trim();
      parsedKeyword = q.split(' in ')[0].trim();
    } else {
      parsedKeyword = q;
    }

    const dateMatch = q.match(/on (\d{1,2}\/\d{1,2}\/\d{4})|(\d{1,2}\/\d{1,2}\/\d{4})/);
    if (dateMatch) {
      parsedDate = dateMatch[1] || dateMatch[2];
      parsedKeyword = parsedKeyword.replace(/on \d{1,2}\/\d{1,2}\/\d{4}/, '').trim();
    }

    parsedKeyword = parsedKeyword.replace(/\s+/g, ' ').trim();

    return { keyword: parsedKeyword, city: parsedCity, date: parsedDate };
  };

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [loading, loadingMessages.length]);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    const userEmail = localStorage.getItem('userEmail');
    const profileData = JSON.parse(localStorage.getItem('profileData')) || {};
    if (isAuthenticated && userEmail) {
      setUser({ email: userEmail, name: profileData.name || 'User', image: profileData.image });
      const userSaved = JSON.parse(localStorage.getItem(`savedEvents_${userEmail}`)) || [];
      const userFavorites = JSON.parse(localStorage.getItem(`favorites_${userEmail}`)) || [];
      setSavedEvents(userSaved);
      setFavorites(userFavorites);
    } else {
      setSavedEvents([]);
      setFavorites([]);
    }

    const fetchUserLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setLocation({ latitude, longitude });
          },
          (error) => {
            console.error('Geolocation error:', error.message);
            setLocation({ latitude: 17.3850, longitude: 78.4867 });
          },
          { enableHighAccuracy: true, timeout: 15000 }
        );
      } else {
        setLocation({ latitude: 17.3850, longitude: 78.4867 });
      }
    };
    fetchUserLocation();
  }, []);

  useEffect(() => {
    localStorage.setItem('events', JSON.stringify(events));
    localStorage.setItem('keyword', keyword);
    localStorage.setItem('city', city);
    localStorage.setItem('date', date);
    if (user) {
      localStorage.setItem(`savedEvents_${user.email}`, JSON.stringify(savedEvents));
      localStorage.setItem(`favorites_${user.email}`, JSON.stringify(favorites));
    }
  }, [events, keyword, city, date, savedEvents, favorites, user]);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleUseLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
          setZoomToUser(true);
        },
        (error) => {
          console.error('Geolocation error:', error.message);
          alert('Failed to retrieve location. Using Hyderabad as default.');
          setLocation({ latitude: 17.3850, longitude: 78.4867 });
          setZoomToUser(true);
        },
        { enableHighAccuracy: true, timeout: 15000 }
      );
    } else {
      alert('Geolocation not supported. Using Hyderabad as default.');
      setLocation({ latitude: 17.3850, longitude: 78.4867 });
      setZoomToUser(true);
    }
  };

  const handleSearch = async (chatbotQuery = '') => {
    const searchKeyword = chatbotQuery || keyword;
    if (!searchKeyword.trim() && !city.trim() && !date.trim()) {
      setError('Please enter a search query or filters');
      alert('Please enter a search query or filters');
      return;
    }

    setLoading(true);
    setError('');
    setZoomToUser(false);

    let finalKeyword = keyword;
    let finalCity = city;
    let finalDate = date;

    if (chatbotQuery) {
      const { keyword: parsedKeyword, city: parsedCity, date: parsedDate } = parseQuery(chatbotQuery);
      finalKeyword = parsedKeyword || 'event';
      finalCity = parsedCity || city;
      finalDate = parsedDate || date;
      setKeyword(finalKeyword);
      setCity(finalCity);
      setDate(finalDate);
    }

    try {
      const cityCoords = finalCity ? await geocodeLocation(finalCity) : location;
      if (cityCoords) setLocation(cityCoords);

      const results = await fetchEvents(finalKeyword, finalCity, finalDate);
      if (results.length === 0) {
        setError('No events found for this search.');
        alert('No events found for this search.');
      }

      const filteredResults = results.filter((event) => {
        const eventTitle = event.title?.toLowerCase() || '';
        const eventVenue = event.venue?.name?.toLowerCase() || event.address?.join(', ')?.toLowerCase() || '';
        const eventDate = event.date?.when?.toLowerCase() || '';
        return (
          eventTitle.includes(finalKeyword.toLowerCase()) ||
          (finalCity && eventVenue.includes(finalCity.toLowerCase())) ||
          (finalDate && eventDate.includes(finalDate))
        );
      });

      const eventsWithCoords = await Promise.all(
        filteredResults.map(async (event) => {
          const venueQuery = event.venue?.name || event.address?.join(', ') || finalCity || 'Hyderabad';
          const coords = await geocodeLocation(venueQuery);
          return {
            ...event,
            latitude: coords?.latitude || location?.latitude || 17.3850,
            longitude: coords?.longitude || location?.longitude || 78.4867,
          };
        })
      );

      setEvents(eventsWithCoords);
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch events';
      console.error('Error fetching events:', errorMessage);
      setError(errorMessage);
      alert(`Failed to fetch events: ${errorMessage}`);
    } finally {
      setLoading(false);
      setQuery('');
    }
  };

  const handleMapView = () => {
    setViewMode('map');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
          setZoomToUser(true);
        },
        (error) => {
          console.error('Map view geolocation error:', error.message);
          alert('Failed to retrieve location. Using Hyderabad as default.');
          setLocation({ latitude: 17.3850, longitude: 78.4867 });
          setZoomToUser(true);
        },
        { enableHighAccuracy: true, timeout: 15000 }
      );
    } else {
      setLocation({ latitude: 17.3850, longitude: 78.4867 });
      setZoomToUser(true);
    }
  };

  const toggleSavedEvent = (event) => {
    if (!user) {
      alert('Please log in to save events.');
      return;
    }
    const userEmail = user.email || 'guest';
    let currentSaved = JSON.parse(localStorage.getItem(`savedEvents_${userEmail}`)) || [];
    const isSaved = currentSaved.some(
      (saved) => saved.title === event.title && saved.date?.when === event.date?.when
    );
    let updatedSaved;
    if (isSaved) {
      updatedSaved = currentSaved.filter(
        (saved) => !(saved.title === event.title && saved.date?.when === event.date?.when)
      );
    } else {
      updatedSaved = [...currentSaved, event];
    }
    setSavedEvents(updatedSaved);
    localStorage.setItem(`savedEvents_${userEmail}`, JSON.stringify(updatedSaved));
  };

  const toggleFavorite = (event) => {
    if (!user) {
      alert('Please log in to favorite events.');
      return;
    }
    const userEmail = user.email || 'guest';
    let currentFavorites = JSON.parse(localStorage.getItem(`favorites_${userEmail}`)) || [];
    const isFavorited = currentFavorites.some(
      (fav) => fav.title === event.title && fav.date?.when === event.date?.when
    );
    let updatedFavorites;
    if (isFavorited) {
      updatedFavorites = currentFavorites.filter(
        (fav) => !(fav.title === event.title && fav.date?.when === event.date?.when)
      );
    } else {
      updatedFavorites = [...currentFavorites, event];
    }
    setFavorites(updatedFavorites);
    localStorage.setItem(`favorites_${userEmail}`, JSON.stringify(updatedFavorites));
  };

  const handleShare = (event) => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: `Check out this event: ${event.title} on ${event.date?.when || 'date TBD'} in ${city}!`,
        url: event.link || window.location.href,
      }).catch((error) => {
        console.error('Error sharing event:', error);
        alert('Failed to share event. Try copying the link manually.');
      });
    } else {
      alert('Sharing is not supported on this device. Copy the event link manually.');
    }
  };

  const requestNotification = (event) => {
    if (!user) {
      alert('Please log in to set notifications.');
      return;
    }
    if (Notification.permission !== 'granted') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          scheduleNotification(event);
        } else {
          alert('Notification permission denied. Please enable notifications in your browser settings.');
        }
      });
    } else {
      scheduleNotification(event);
    }
  };

  const scheduleNotification = (event) => {
    let dateString = event.date?.when;
    if (!dateString) {
      alert('Cannot schedule notification: No event date available.');
      return;
    }
    if (!dateString.includes('2025')) {
      dateString = `${dateString}, 2025`;
    } else if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      dateString = `${dateString}T00:00:00`;
    }
    const eventDate = new Date(dateString);
    if (isNaN(eventDate.getTime())) {
      alert('Cannot schedule notification: Invalid event date.');
      return;
    }
    setTimeout(() => {
      new Notification(`Event Reminder: ${event.title}`, {
        body: `Your event in ${city} is happening soon on ${event.date?.when}!`,
        icon: '/favicon.ico',
      });
    }, 5000);
    alert(`Notification scheduled for ${event.title} on ${event.date?.when || 'the event date'}`);
  };

  const isClosingSoon = (dateString) => {
    if (!dateString) return false;
    let normalizedDate = dateString.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(normalizedDate)) {
      normalizedDate = `${normalizedDate}T00:00:00`;
    } else if (/^\d{1,2}\s+[A-Za-z]+\s+\d{4}$/.test(normalizedDate)) {
      const [day, month, year] = normalizedDate.split(/\s+/);
      normalizedDate = `${month} ${day}, ${year}`;
    } else if (!normalizedDate.includes('2025')) {
      normalizedDate = `${normalizedDate}, 2025`;
    }
    const eventDate = new Date(normalizedDate);
    if (isNaN(eventDate.getTime())) return false;
    const targetDates = [
      new Date('2025-05-17T00:00:00'),
      new Date('2025-05-19T00:00:00'),
    ];
    return targetDates.some(
      (target) =>
        eventDate.getFullYear() === target.getFullYear() &&
        eventDate.getMonth() === target.getMonth() &&
        eventDate.getDate() === target.getDate()
    );
  };

  const isTrending = (index) => events.length > 1 && index < 3;

  const tileContent = ({ date, view }) => {
    if (view !== 'month') return null;
    const hasEvents = savedEvents.some((event) => {
      const eventDateStr = event.date?.when;
      if (!eventDateStr) return false;
      const eventDate = new Date(eventDateStr.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$2/$1/$3'));
      return (
        eventDate.getFullYear() === date.getFullYear() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getDate() === date.getDate()
      );
    });
    return hasEvents ? <div className="calendar-event-marker"></div> : null;
  };
  
  const handleDateClick = (date) => {
    const dateString = date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });
    const eventsOnDate = savedEvents.filter((event) => {
      const eventDate = event.date?.when;
      return eventDate && eventDate.includes(dateString);
    });
    if (eventsOnDate.length > 0) {
      alert(`Events on ${dateString}:\n${eventsOnDate.map((e) => e.title).join('\n')}`);
    }
  };

  return (
    <div className={`App ${darkMode ? 'dark-mode' : ''}`}>
      <header className={`header ${darkMode ? 'dark-mode' : ''}`}>
        <div className="logo">
          <h1> 🎉 Event Finder </h1>
        </div>
        <div className="auth-buttons">
          {user ? (
            <>
              <span>Welcome, {user.name}</span>
              <button
                className="calendar-btn"
                onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                title="Calendar"
              >
                <FaCalendarAlt />
              </button>
              <Link to="/dashboard">
                <button className="profile-btn" title="Profile">
                  {user.image ? (
                    <img src={user.image} alt="Profile" className="profile-image" />
                  ) : (
                    <FaUserCircle />
                  )}
                </button>
              </Link>
              <Link to="/settings">
                <button className="settings-btn" title="Settings">
                  <FaCog />
                </button>
              </Link>
            </>
          ) : (
            <>
              <Link to="/login">
                <button className="login-btn">Login</button>
              </Link>
              <Link to="/signup">
                <button className="signup-btn">Sign Up</button>
              </Link>
            </>
          )}
        </div>
      </header>

      {isCalendarOpen && (
        <section className={`calendar-section ${darkMode ? 'dark-mode' : ''}`}>
          <h2>Your Event Calendar</h2>
          <Calendar
            tileContent={tileContent}
            onClickDay={handleDateClick}
            className={darkMode ? 'dark-mode' : ''}
          />
        </section>
      )}

      <section className={`hero ${darkMode ? 'dark-mode' : ''}`}>
        <h1>Discover Events Near You</h1>
        <p>Find the best events happening around you!</p>
      </section>

      <section className="filters">
        <div className="filter-container">
          <input
            type="text"
            placeholder="Keyword (e.g., RCB vs LSG)"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className={`filter-input ${darkMode ? 'dark-mode' : ''}`}
          />
          <input
            type="text"
            placeholder="City (e.g., Lucknow)"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className={`filter-input ${darkMode ? 'dark-mode' : ''}`}
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={`filter-input ${darkMode ? 'dark-mode' : ''}`}
          />
          <button className="location-btn" onClick={handleUseLocation}>
            <MdLocationOn /> Use My Location
          </button>
          <button className="search-btn" onClick={() => handleSearch()} disabled={loading}>
            {loading ? 'Searching...' : 'Search Events'}
          </button>
        </div>
      </section>

      <div className="view-toggle">
        <button
          className={`view-btn ${viewMode === 'list' ? 'active' : ''} ${darkMode ? 'dark-mode' : ''}`}
          onClick={() => setViewMode('list')}
        >
          <FaList /> List
        </button>
        <button
          className={`view-btn ${viewMode === 'grid' ? 'active' : ''} ${darkMode ? 'dark-mode' : ''}`}
          onClick={() => setViewMode('grid')}
        >
          <FaThLarge /> Grid
        </button>
        <button
          className={`view-btn ${viewMode === 'map' ? 'active' : ''} ${darkMode ? 'dark-mode' : ''}`}
          onClick={handleMapView}
        >
          <FaMap /> Map
        </button>
      </div>

      {loading && (
        <p className="loading-message">{loadingMessages[loadingMessageIndex]}</p>
      )}
      {error && (
        <p className="error" style={{ color: 'red' }}>
          {error}
        </p>
      )}
      {!loading && !error && events.length === 0 && <p>No events found.</p>}
      {!loading && !error && events.length > 0 && (
        <>
          <p className="event-counter">{events.length} event{events.length !== 1 ? 's' : ''} found</p>
          <div className={`events-container ${viewMode} ${darkMode ? 'dark-mode' : ''}`}>
            {viewMode === 'map' ? (
              <MapView events={events} center={location} zoomToUser={zoomToUser} />
            ) : (
              events.map((event, index) => (
                <div
                  key={event.title + index}
                  className={`event-card ${darkMode ? 'dark-mode' : ''}`}
                >
                  {event.image ? (
                    <img src={event.image} alt={event.title} className="event-image" />
                  ) : (
                    <div className={`event-placeholder ${getCategory().toLowerCase()}`}>
                      {getCategoryIcon(getCategory())}
                    </div>
                  )}
                  <div className={`category-badge ${getCategory().toLowerCase()}`}>
                    {getCategory()}
                  </div>
                  {isTrending(index) && (
                    <div className="trending-info">
                      <FaChartLine /> This event has gone up in bookings!
                    </div>
                  )}
                  {isClosingSoon(event.date?.when) && (
                    <div className="closing-soon">Event closing soon!</div>
                  )}
                  <h2>{event.title || 'Untitled Event'}</h2>
                  <p>
                    <strong>Venue:</strong>{' '}
                    {event.venue?.name || event.address?.join(', ') || 'Not specified'}
                  </p>
                  <p>
                    <strong>Time:</strong> {event.date?.when || 'Not specified'}
                  </p>
                  <p>
                    <strong>Description:</strong>{' '}
                    {event.description || 'No description available'}
                  </p>
                  {event.ticket_info && (
                    <div>
                      <strong>Tickets:</strong>
                      <ul>
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
                  {event.link && (
                    <a href={event.link} target="_blank" rel="noopener noreferrer">
                      More Info
                    </a>
                  )}
                  {user && (
                    <div className="event-actions">
                      <button
                        className={`favorite-btn ${favorites.some(
                          (fav) =>
                            fav.title === event.title && fav.date?.when === event.date?.when
                        ) ? 'favorited' : ''}`}
                        onClick={() => toggleFavorite(event)}
                        title="Favorite Event"
                      >
                        <FaHeart />
                      </button>
                      <button
                        className={`save-btn ${savedEvents.some(
                          (saved) =>
                            saved.title === event.title && saved.date?.when === event.date?.when
                        ) ? 'saved' : ''}`}
                        onClick={() => toggleSavedEvent(event)}
                        title="Save Event"
                      >
                        <FaBookmark />
                      </button>
                      <button
                        className="notify-btn"
                        onClick={() => requestNotification(event)}
                        title="Set Notification"
                      >
                        <FaBell />
                      </button>
                      <button
                        className="share-btn"
                        onClick={() => handleShare(event)}
                        title="Share Event"
                      >
                        <FaShareAlt />
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </>
      )}
      {showBackToTop && (
        <button
          className="back-to-top"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          ↑ Top
        </button>
      )}

      <div className={`chatbot-container ${isChatbotOpen ? 'open' : ''} ${darkMode ? 'dark-mode' : ''}`}>
        <button
          className="chatbot-toggle"
          onClick={() => setIsChatbotOpen(!isChatbotOpen)}
        >
          <FaComment />
        </button>
        {isChatbotOpen && (
          <div className="chatbot-window">
            <h3>Event Search Assistant</h3>
            <input
              type="text"
              placeholder="e.g., RCB vs LSG in Lucknow"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="chatbot-input"
            />
            <button
              className="chatbot-search-btn"
              onClick={() => handleSearch(query)}
              disabled={loading}
            >
              Search
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const toggleDarkMode = () => setDarkMode(!darkMode);
  return (
    <DarkModeProvider>
      <UserProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/profile-setup" element={<ProfileSetup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/settings" element={<Settings darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
          </Routes>
        </Router>
      </UserProvider>
    </DarkModeProvider>
  );
}

export default App;