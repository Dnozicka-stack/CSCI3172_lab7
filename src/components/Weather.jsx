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
      // Check if we're in a secure context (HTTPS)
      if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
        setError('Weather widget requires a secure connection (HTTPS)');
        setLoading(false);
        return;
      }

      if (!navigator.geolocation) {
        setError('Geolocation is not supported by your browser');
        setLoading(false);
        return;
      }

      // Request location with high accuracy
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('Location obtained:', position.coords);
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
          let errorMessage = 'Unable to retrieve your location';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access was denied. Please enable location access in your browser settings.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out.';
              break;
            default:
              errorMessage = 'An unknown error occurred.';
          }
          setError(errorMessage);
          setLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000, // Increased timeout to 10 seconds
          maximumAge: 0
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
        console.log('Fetching weather for location:', location);
        // Use the Netlify function instead of direct API call
        const response = await fetch(
          `/.netlify/functions/getWeather?lat=${location.lat}&lon=${location.lon}`
        );

        const data = await response.json();
        console.log('Weather API response:', data);

        if (!response.ok) {
          throw new Error(data.error || data.details || `HTTP error! status: ${response.status}`);
        }
        
        // Update weather state with relevant information
        setWeather({
          city: data.name,
          temperature: Math.round(data.main.temp),
          humidity: data.main.humidity,
          description: data.weather[0].description
        });
      } catch (err) {
        console.error('Error fetching weather:', err);
        setError(err.message || 'Failed to fetch weather data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [location]);

  // Return based on loading, error, or weather data
  if (loading) return (
    <div className="weather-card" role="region" aria-label="Weather Information">
      <div className="weather-card-content">
        <h3>Weather Information</h3>
        <div className="weather-info">
          <p aria-live="polite">Getting your location and weather data...</p>
        </div>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="weather-card" role="region" aria-label="Weather Information">
      <div className="weather-card-content">
        <h3>Weather Information</h3>
        <div className="weather-info">
          <p className="error-message" role="alert">{error}</p>
          <p className="help-text">Please enable location access or try again later.</p>
        </div>
      </div>
    </div>
  );
  
  if (!weather) return null;

  return (
    <div className="weather-card" role="region" aria-label="Weather Information">
      <div className="weather-card-content">
        <h3>Weather in {weather.city}</h3>
        <div className="weather-info">
          <div className="weather-detail">
            <span className="weather-label">Temperature:</span>
            <span className="weather-value" aria-label={`${weather.temperature} degrees Celsius`}>
              {weather.temperature}°C
            </span>
          </div>
          <div className="weather-detail">
            <span className="weather-label">Humidity:</span>
            <span className="weather-value" aria-label={`${weather.humidity} percent humidity`}>
              {weather.humidity}%
            </span>
          </div>
          <div className="weather-detail">
            <span className="weather-label">Conditions:</span>
            <span className="weather-value" aria-label={`Current conditions: ${weather.description}`}>
              {weather.description}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Weather;