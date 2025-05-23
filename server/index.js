const express = require('express');
const axios = require('axios');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const SERPAPI_KEY = process.env.SERPAPI_KEY;

// Map frontend categories to SerpApi-compatible terms
const categoryMap = {
  concerts: 'concerts',
  sports: 'sports',
  theater: 'theater',
  festivals: 'festivals',
};

app.get('/api/events', async (req, res) => {
  const { keyword, city, date, category } = req.query;

  // Validate required parameters
  if (!keyword || !city) {
    return res.status(400).json({ error: 'Keyword and city are required' });
  }

  // Format SerpApi query parameters
  let query = keyword;
  if (category && categoryMap[category]) {
    query += ` ${categoryMap[category]}`;
  }
  query += ` events in ${city}`;

  const serpParams = {
    engine: 'google_events',
    q: query,
    hl: 'en',
    api_key: SERPAPI_KEY,
    location: city,
  };

  // Add date filter if provided (format: YYYY-MM-DD)
  if (date) {
    try {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate)) throw new Error('Invalid date format');
      serpParams.start_date = parsedDate.toISOString().split('T')[0];
    } catch {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }
  }

  try {
    // Fetch events from SerpApi
    const serpResponse = await axios.get('https://serpapi.com/search.json', {
      params: serpParams,
    });

    const events = serpResponse.data.events_results || [];

    // Return raw SerpApi data without OpenAI processing
    res.json(events);
  } catch (error) {
    console.error('❌ Server Error fetching events:', error.message);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));