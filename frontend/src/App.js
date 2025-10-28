import React, { useState } from "react";
import { WiDaySunny, WiCloud, WiRain, WiSnow, WiStrongWind, WiHumidity, WiStrongWind as WiWind } from "react-icons/wi";
import "./App.css";

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [unit, setUnit] = useState("celsius");

  const getWeather = async () => {
    if (!city.trim()) {
      setError("Please enter a city name");
      setWeather(null);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`http://localhost:5000/weather?q=${encodeURIComponent(city)}`);
      const data = await response.json();

      if (response.ok) {
        setWeather(data);
      } else {
        setError(data.error || "City not found");
        setWeather(null);
      }
    } catch {
      setError("Failed to fetch weather data. Make sure the server is running.");
      setWeather(null);
    }
    setLoading(false);
  };

  const getWeatherIcon = (main) => {
    const iconProps = { size: 80 };
    
    switch (main) {
      case "Clear": return <WiDaySunny {...iconProps} color="#FFD93D" />;
      case "Clouds": return <WiCloud {...iconProps} color="#B0BEC5" />;
      case "Rain": return <WiRain {...iconProps} color="#4FC3F7" />;
      case "Snow": return <WiSnow {...iconProps} color="#90CAF9" />;
      default: return <WiStrongWind {...iconProps} color="#4DB6AC" />;
    }
  };

  const convertTemp = (temp) => {
    if (unit === "fahrenheit") {
      return Math.round((temp * 9/5) + 32);
    }
    return Math.round(temp);
  };

  const toggleUnit = () => {
    setUnit(unit === "celsius" ? "fahrenheit" : "celsius");
  };

  return (
    <div className="app">
      <h1 className="title">🌤️ Weather App</h1>

      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="Enter city name..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && getWeather()}
        />
        <button className="search-button" onClick={getWeather} disabled={loading}>
          {loading ? "Searching..." : "🔍 Search"}
        </button>
      </div>

      {error && <p className="error-message">{error}</p>}

      {weather && (
        <div className="weather-card">
          <div className="unit-toggle">
            <button className="unit-button" onClick={toggleUnit}>
              Switch to {unit === "celsius" ? "°F" : "°C"}
            </button>
          </div>

          <div className="weather-icon">
            {getWeatherIcon(weather.weather[0].main)}
          </div>
          
          <div className="weather-header">
            <h2>{weather.name}, {weather.sys.country}</h2>
            <h3>{weather.weather[0].description}</h3>
          </div>
          
          <p className="temperature">
            {convertTemp(weather.main.temp)}°{unit === "celsius" ? "C" : "F"}
          </p>
          
          <div className="weather-details">
            <div className="detail-item">
              <WiHumidity size={24} />
              <span>{weather.main.humidity}%</span>
            </div>
            <div className="detail-item">
              <WiWind size={24} />
              <span>{weather.wind.speed} m/s</span>
            </div>
            <div className="detail-item">
              <span>🌡️</span>
              <span>{convertTemp(weather.main.feels_like)}°</span>
            </div>
            <div className="detail-item">
              <span>💨</span>
              <span>{weather.main.pressure} hPa</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;