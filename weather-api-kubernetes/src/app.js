const express = require('express');
const cors = require('cors');
const WeatherService = require('./weather-service');

const app = express();
const weatherService = new WeatherService();

// Enable CORS for all routes
app.use(cors());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Weather API endpoint
app.get('/api/weather/:location', async (req, res) => {
  try {
    const location = req.params.location;
    const weatherData = await weatherService.getWeatherForLocation(location);
    res.json(weatherData);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
});

// Default route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Weather API - Kubernetes Version', 
    usage: 'GET /api/weather/{location}',
    examples: Object.keys(weatherService.mockWeatherData).map(
      loc => `/api/weather/${loc}`
    )
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app;