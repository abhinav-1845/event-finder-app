import axios from 'axios';

export async function fetchEvents(keyword, city, date, category) {
  // Validate inputs
  if (!keyword || !city) {
    throw new Error('Keyword and city are required');
  }

  try {
    const response = await axios.get('/api/events', {
      params: {
        keyword: keyword.trim(),
        city: city.trim(),
        date: date || undefined, // Include date if provided
        category: category || undefined, // Include category if provided
      },
    });
    return response.data;
  } catch (error) {
    // Log the error and rethrow with backend message if available
    const errorMessage = error.response?.data?.error || error.message;
    console.error('❌ Error fetching events:', errorMessage);
    throw new Error(errorMessage);
  }
}