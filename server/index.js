require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 5000;
const TICKETMASTER_API_KEY = process.env.TICKETMASTER_API_KEY;

console.log("✅ Ticketmaster Key Loaded:", TICKETMASTER_API_KEY);

app.get('/api/events', async (req, res) => {
  const { keyword, city } = req.query;

  const params = {
    apikey: TICKETMASTER_API_KEY,
    keyword: keyword || 'music',
    city: city || 'New York',
    startDateTime: '2025-05-25T00:00:00Z',
    sort: 'date,asc'
  };

  try {
    const response = await axios.get('https://app.ticketmaster.com/discovery/v2/events.json', {
      params: params
    });

    const events = response.data._embedded?.events || [];

    console.log(`📦 Fetched ${events.length} events for city: ${city}, keyword: ${keyword}`);

    res.json(events.map(event => ({
      id: event.id,
      name: event.name,
      date: event.dates.start.localDate
    })));
  } catch (error) {
    console.error('❌ Error fetching events from Ticketmaster:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
