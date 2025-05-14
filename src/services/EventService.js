// src/services/EventService.js
import axios from 'axios';

export async function fetchEvents(keyword, city) {
  try {
    const response = await axios.get('/api/events', {
      params: {
        keyword,
        city
      }
    });

    return response.data;
  } catch (error) {
    console.error('❌ Error fetching events from backend:', error.message);
    return [];
  }
}
  