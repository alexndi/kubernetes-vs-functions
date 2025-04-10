import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [location, setLocation] = useState('london');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [backend, setBackend] = useState('kubernetes'); // 'kubernetes' or 'azure'
  
  // Configure your backend URLs here
  const BACKENDS = {
    kubernetes: 'http://192.168.49.2:32751', // Use your Minikube nodeport
    azure: 'http://localhost:7071'        // Local Azure Functions port
  };
  
  const fetchWeather = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const baseUrl = BACKENDS[backend];
      const endpoint = backend === 'kubernetes' 
        ? `${baseUrl}/api/weather/${location}`
        : `${baseUrl}/api/weather/${location}`;
        
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setWeatherData(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching weather:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch weather when location or backend changes
  useEffect(() => {
    if (location) {
      fetchWeather();
    }
  }, [location, backend]);
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    fetchWeather();
  };
  
  return (
    <div className="App">
      <header className="App-header">
        <h1>Weather API Demo</h1>
        <div className="backend-selector">
          <label>
            <input 
              type="radio" 
              value="kubernetes" 
              checked={backend === 'kubernetes'} 
              onChange={() => setBackend('kubernetes')} 
            />
            Kubernetes Backend
          </label>
          <label>
            <input 
              type="radio" 
              value="azure" 
              checked={backend === 'azure'} 
              onChange={() => setBackend('azure')} 
            />
            Azure Functions Backend
          </label>
        </div>
        <p className="backend-info">
          Currently using the <strong>{backend}</strong> backend
        </p>
      </header>
      
      <main>
        <form onSubmit={handleSubmit} className="weather-form">
          <select 
            value={location} 
            onChange={(e) => setLocation(e.target.value)}
          >
            <option value="london">London</option>
            <option value="new york">New York</option>
            <option value="tokyo">Tokyo</option>
            <option value="sydney">Sydney</option>
            <option value="paris">Paris</option>
          </select>
          <button type="submit">Get Weather</button>
        </form>
        
        <div className="weather-display">
          {loading && <p>Loading weather data...</p>}
          {error && <p className="error">Error: {error}</p>}
          
          {weatherData && !loading && !error && (
            <div className="weather-card">
              <h2>{weatherData.location}</h2>
              <div className="weather-details">
                <p className="temp">{weatherData.weather.temp}°C</p>
                <p className="condition">{weatherData.weather.condition}</p>
                <p className="humidity">Humidity: {weatherData.weather.humidity}%</p>
              </div>
              <p className="timestamp">Last updated: {new Date(weatherData.timestamp).toLocaleString()}</p>
            </div>
          )}
        </div>
      </main>
      
      <footer>
        <p>Kubernetes vs. Azure Functions Demo</p>
      </footer>
    </div>
  );
}

export default App;
