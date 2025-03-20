import { useState, useEffect } from 'react';

/**
 * Weather Component
 * Displays current weather information for the user's location using the OpenWeatherMap API
 * Shows temperature in Celsius and humidity percentage
 */
function Weather() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState(null);

  /**
   * useEffect hook to get user's location and fetch weather data
   */
  useEffect(() => {
    const getLocation = () => {
      if (!navigator.geolocation) {
        setError('Geolocation is not supported by your browser');
        setLoading(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (error) => {
          setError('Unable to retrieve your location');
          console.error('Geolocation error:', error);
          setLoading(false);
        }
      );
    };

    getLocation();
  }, []);

  /**
   * useEffect hook to fetch weather data when location is available
   */
  useEffect(() => {
    const fetchWeather = async () => {
      if (!location) return;

      try {
        const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
        
        if (!API_KEY) {
          throw new Error('Weather API key is not configured');
        }
        
        // Make API request to OpenWeatherMap with metric units using coordinates
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&appid=${API_KEY}&units=metric`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Update weather state with relevant information
        setWeather({
          city: data.name,
          temperature: Math.round(data.main.temp),
          humidity: data.main.humidity,
          description: data.weather[0].description
        });
      } catch (err) {
        setError('Failed to fetch weather data');
        console.error('Error fetching weather:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [location]);

  // Return based on loading, error, or weather data
  if (loading) return (
    <div className="weather-card">
      <div className="weather-card-content">
        <h3>Weather Information</h3>
        <div className="weather-info">
          <p>Getting your location and weather data...</p>
        </div>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="weather-card">
      <div className="weather-card-content">
        <h3>Weather Information</h3>
        <div className="weather-info">
          <p className="error-message">{error}</p>
          <p className="help-text">Please enable location access or try again later.</p>
        </div>
      </div>
    </div>
  );
  
  if (!weather) return null;

  return (
    <div className="weather-card">
      <div className="weather-card-content">
        <h3>Weather in {weather.city}</h3>
        <div className="weather-info">
          <div className="weather-detail">
            <span className="weather-label">Temperature:</span>
            <span className="weather-value">{weather.temperature}°C</span>
          </div>
          <div className="weather-detail">
            <span className="weather-label">Humidity:</span>
            <span className="weather-value">{weather.humidity}%</span>
          </div>
          <div className="weather-detail">
            <span className="weather-label">Conditions:</span>
            <span className="weather-value">{weather.description}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Weather; 