import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import {
  FaList,
  FaThLarge,
  FaMap,
  FaGlobeAsia,
  FaUserCircle,
  FaCog,
} from 'react-icons/fa';
import { MdLocationOn } from 'react-icons/md';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { DarkModeProvider } from './context/DarkModeContext';
import { UserProvider } from './context/UserContext';

import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProfileSetup from './pages/ProfileSetup';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import PlanDay from './pages/PlanDay';

import './App.css';

// Import the service
import { fetchEvents } from './services/EventService';

// Fix Leaflet default marker icon issue and set custom marker
const customMarkerIcon = new L.Icon({
  iconUrl: '/leaflet/marker-icon.png', // Local path
  iconRetinaUrl: '/leaflet/marker-icon-2x.png', // Local path
  shadowUrl: '/leaflet/marker-shadow.png', // Local path
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Log icon URLs for debugging
console.log('Marker icon URLs:', {
  iconUrl: '/leaflet/marker-icon.png',
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  shadowUrl: '/leaflet/marker-shadow.png',
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
      console.log('Flying to user location:', [center.latitude, center.longitude]);
      map.flyTo([center.latitude, center.longitude], 15, { duration: 1 });
    }
  }, [zoomToUser, center, map]);

  useEffect(() => {
    if (events.length > 0 && center && center.latitude && center.longitude) {
      const validMarkers = events
        .filter((e) => e.latitude && e.longitude)
        .map((e) => [e.latitude, e.longitude]);
      // Include user's location in bounds
      const allPoints = [...validMarkers, [center.latitude, center.longitude]];
      if (allPoints.length > 1) {
        const bounds = L.latLngBounds(allPoints);
        console.log('Fitting bounds:', bounds);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15, minZoom: 10 });
      } else if (allPoints.length === 1) {
        map.setView(allPoints[0], 15);
      }
    }
  }, [events, center, map]);

  return null;
}

function MapView({ events, center, zoomToUser }) {
  // Default center: Hyderabad, India
  const defaultCenter = [17.3850, 78.4867];
  const mapCenter = center && center.latitude && center.longitude
    ? [center.latitude, center.longitude]
    : defaultCenter;

  console.log('Map center:', mapCenter);
  console.log('Events:', events);

  return (
    <MapContainer center={mapCenter} zoom={13} className="leaflet-container">
      <TileLayer
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapController center={center} events={events} zoomToUser={zoomToUser} />
      {events.map((event) => {
        // Fallback to map center (user's location or Hyderabad) if event coordinates are missing
        const position = event.latitude && event.longitude
          ? [event.latitude, event.longitude]
          : mapCenter;

        console.log(`Event ${event.name} position:`, position);

        return (
          <Marker key={event.id} position={position} icon={customMarkerIcon}>
            <Popup>
              <div>
                <h3>{event.name}</h3>
                <p>{event.venue_name}</p>
                <p>{event.time}</p>
                <a href={event.url} target="_blank" rel="noopener noreferrer">
                  More Info
                </a>
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
  const [events, setEvents] = useState([]);
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [zoomToUser, setZoomToUser] = useState(false);

  // Fetch user location on component mount
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    const userEmail = localStorage.getItem('userEmail');
    const profileData = JSON.parse(localStorage.getItem('profileData')) || {};
    if (isAuthenticated && userEmail) {
      setUser({ email: userEmail, name: profileData.name || 'User' });
    }

    const fetchUserLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude, accuracy } = position.coords;
            console.log('Initial user location:', { latitude, longitude, accuracy, timestamp: position.timestamp });
            setLocation({ latitude, longitude });
          },
          (error) => {
            console.error('Initial geolocation error:', error.message);
            // Fallback to Hyderabad, India
            setLocation({ latitude: 17.3850, longitude: 78.4867 });
            console.log('Falling back to Hyderabad: [17.3850, 78.4867]');
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
      } else {
        console.warn('Geolocation not supported, using Hyderabad fallback');
        setLocation({ latitude: 17.3850, longitude: 78.4867 });
      }
    };

    fetchUserLocation();
  }, []);

  const handleUseLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          console.log('User location (manual):', { latitude, longitude, accuracy, timestamp: position.timestamp });
          setLocation({ latitude, longitude });
          setZoomToUser(true);
        },
        (error) => {
          console.error('Geolocation error:', error.message);
          alert(`Failed to retrieve location: ${error.message}. Using Hyderabad as default.`);
          setLocation({ latitude: 17.3850, longitude: 78.4867 });
          setZoomToUser(true);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    } else {
      alert('Geolocation is not supported by this browser. Using Hyderabad as default.');
      setLocation({ latitude: 17.3850, longitude: 78.4867 });
      setZoomToUser(true);
    }
  };

  const handleSearch = async () => {
    if (!city.trim()) {
      alert('Please enter a city name');
      return;
    }

    setLoading(true);
    setZoomToUser(false); // Reset zoom to user for search
    try {
      // Geocode the city to get coordinates
      const cityCoords = await geocodeLocation(city);
      if (cityCoords) {
        console.log('City coordinates:', cityCoords);
        setLocation(cityCoords);
      } else {
        console.warn('City not found, keeping current location');
      }

      // Fetch events
      const results = await fetchEvents(city);
      if (results.length === 0) {
        alert('No events found for this city.');
      }

      // Geocode venues if coordinates are missing
      const eventsWithCoords = await Promise.all(
        results.map(async (event) => {
          if (!event.latitude || !event.longitude) {
            const coords = await geocodeLocation(event.venue_name);
            return {
              ...event,
              latitude: coords?.latitude || location?.latitude || 17.3850,
              longitude: coords?.longitude || location?.longitude || 78.4867,
            };
          }
          return event;
        })
      );

      console.log('Events with coordinates:', eventsWithCoords);
      setEvents(eventsWithCoords);
    } catch (error) {
      console.error('Error fetching events:', error);
      alert('Failed to fetch events. Please try again later.');
      setEvents([]);
    }
    setLoading(false);
  };

  const handleMapView = () => {
    setViewMode('map');
    // Trigger zoom to user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          console.log('Map view user location:', { latitude, longitude, accuracy, timestamp: position.timestamp });
          setLocation({ latitude, longitude });
          setZoomToUser(true);
        },
        (error) => {
          console.error('Map view geolocation error:', error.message);
          alert(`Failed to retrieve location: ${error.message}. Using Hyderabad as default.`);
          setLocation({ latitude: 17.3850, longitude: 78.4867 });
          setZoomToUser(true);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    } else {
      console.warn('Geolocation not supported, using Hyderabad');
      setLocation({ latitude: 17.3850, longitude: 78.4867 });
      setZoomToUser(true);
    }
  };

  return (
    <div className={`App ${darkMode ? 'dark-mode' : ''}`}>
      <header className={`header ${darkMode ? 'dark-mode' : ''}`}>
        <div className="logo">
          <FaGlobeAsia className="logo-icon" />
          <h1>Event Sphere</h1>
        </div>

        <div className="search-container">
          <input type="text" placeholder="Search events..." className={`search-bar ${darkMode ? 'dark-mode' : ''}`} />
        </div>

        <div className={`auth-buttons ${darkMode ? 'dark-mode' : ''}`}>
          {user ? (
            <>
              <span>Welcome, {user.name}</span>

              <Link to="/dashboard">
                <button className="profile-btn" title="Profile">
                  <FaUserCircle />
                </button>
              </Link>

              <Link
                to="/plan-day"
                state={{ selectedEvents: events }}
                style={{ marginLeft: '1rem' }}
              >
                <button className="plan-day-btn">🗓️ Plan My Day</button>
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

      <section className={`hero ${darkMode ? 'dark-mode' : ''}`}>
        <h1>Discover Events Near You</h1>
        <p>Find the best events happening around you and never miss out!</p>
      </section>

      <section className="filters">
        <div className="filter-container">
          <input
            type="text"
            placeholder="Enter city name (e.g., Hyderabad)"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className={`filter-dropdown ${darkMode ? 'dark-mode' : ''}`}
          />

          <select className={`filter-dropdown ${darkMode ? 'dark-mode' : ''}`}>
            <option value="Eveything">Select Category</option>
            <option value="music">Music</option>
            <option value="sports">Sports</option>
            <option value="arts">Arts</option>
            <option value="tech">tech</option>
            <option value="ai">ai</option>
            <option value="Comedy">Comedy</option>
            <option value="StartUp">StartUp</option>
            <option value="Gaming">Gaming</option>
            <option value="literature">literature</option>
          </select>

          <input type="date" className={`filter-dropdown ${darkMode ? 'dark-mode' : ''}`} />

          <button className="location-btn" onClick={handleUseLocation}>
            <MdLocationOn /> Use My Location
          </button>

          <button className="search-btn" onClick={handleSearch} disabled={loading}>
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

      <div className={`events-container ${viewMode} ${darkMode ? 'dark-mode' : ''}`}>
        {viewMode === 'map' ? (
          <MapView events={events} center={location} zoomToUser={zoomToUser} />
        ) : events.length > 0 ? (
          events.map((event) => (
            <div key={event.id} className={`event-card ${darkMode ? 'dark-mode' : ''}`}>
              <h2>{event.name}</h2>
              <p>{event.venue_name}</p>
              <p>{event.time}</p>
              <a href={event.url} target="_blank" rel="noopener noreferrer">
                More Info
              </a>
            </div>
          ))
        ) : (
          <p>No events found for this location</p>
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
            <Route path="/plan-day" element={<PlanDay />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/settings" element={<Settings darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
          </Routes>
        </Router>
      </UserProvider>
    </DarkModeProvider>
  );
}

export default App;