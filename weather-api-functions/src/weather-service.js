// src/weather-service.js
class WeatherService {
    constructor() {
      // In a real app, this would be replaced with an actual weather API call
      this.mockWeatherData = {
        'new york': { temp: 15, condition: 'Partly Cloudy', humidity: 45 },
        'london': { temp: 12, condition: 'Rainy', humidity: 80 },
        'tokyo': { temp: 25, condition: 'Sunny', humidity: 30 },
        'sydney': { temp: 22, condition: 'Clear', humidity: 50 },
        'paris': { temp: 18, condition: 'Cloudy', humidity: 60 }
      };
    }
  
    async getWeatherForLocation(location) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const normalizedLocation = location.toLowerCase();
      if (this.mockWeatherData[normalizedLocation]) {
        return {
          location: location,
          weather: this.mockWeatherData[normalizedLocation],
          timestamp: new Date().toISOString()
        };
      } else {
        return { 
          error: 'Location not found',
          availableLocations: Object.keys(this.mockWeatherData)
        };
      }
    }
  }
  
  module.exports = WeatherService;