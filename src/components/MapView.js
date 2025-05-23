import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../App.css';

// Custom marker icon
const customIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="%234CAF50" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5 14.5 7.62 14.5 9s-1.12 2.5-2.5 2.5z"/></svg>',
  iconSize: [24, 24],
  iconAnchor: [12, 24],
  popupAnchor: [0, -24]
});

const darkCustomIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="%231565C0" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5 14.5 7.62 14.5 9s-1.12 2.5-2.5 2.5z"/></svg>',
  iconSize: [24, 24],
  iconAnchor: [12, 24],
  popupAnchor: [0, -24]
});

const MapView = ({ events, darkMode }) => {
  const defaultCenter = [51.505, -0.09]; // Default to London if no events
  const center = events.length > 0 && events[0].lat && events[0].lng 
    ? [events[0].lat, events[0].lng] 
    : defaultCenter;

  return (
    <MapContainer center={center} zoom={13} className={`leaflet-container ${darkMode ? 'dark-mode' : ''}`}>
      <TileLayer
        url={darkMode 
          ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
          : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'}
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {events.map(event => (
        event.lat && event.lng && (
          <Marker 
            key={event.id} 
            position={[event.lat, event.lng]} 
            icon={darkMode ? darkCustomIcon : customIcon}
          >
            <Popup className={`leaflet-popup-content ${darkMode ? 'dark-mode' : ''}`}>
              <h3>{event.title}</h3>
              <p><strong>Date:</strong> {event.date}</p>
              <p><strong>Location:</strong> {event.location}</p>
              <p><strong>Category:</strong> {event.category}</p>
              <a href={event.link} target="_blank" rel="noopener noreferrer">Learn More</a>
            </Popup>
          </Marker>
        )
      ))}
    </MapContainer>
  );
};

export default MapView;