import React, { useState, useEffect } from "react";
import { WiDaySunny, WiCloud, WiRain, WiSnow, WiStrongWind, WiHumidity, WiStrongWind as WiWind } from "react-icons/wi";
import "./App.css";
import FavouriteIcon from './components/FavouriteIcon';

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [unit, setUnit] = useState("celsius");
  const [favouriteCities, setFavouriteCities] = useState([]);
  const [showFavourites, setShowFavourites] = useState(false);

  // Charger les villes favorites au démarrage
  useEffect(() => {
    const savedFavourites = JSON.parse(localStorage.getItem('favouriteCities') || '[]');
    setFavouriteCities(savedFavourites);
  }, []);

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
        setShowFavourites(false);
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

  const handleFavouriteToggle = (isFavourite, cityData) => {
    // Vérification de sécurité
      if (!cityData || !cityData.name) {
       console.error("Erreur: Données de ville manquantes", cityData);
       return;
  }
    const savedFavourites = JSON.parse(localStorage.getItem('favouriteCities') || '[]');
  setFavouriteCities(savedFavourites);
  console.log(`${cityData.name} ${isFavourite ? 'ajoutée aux' : 'retirée des'} favoris`);
  };

  const loadFavouriteCity = (favCity) => {
    setCity(favCity.name);
    setShowFavourites(false);
    setTimeout(() => {
      getWeather();
    }, 100);
  };

  const removeFavourite = (cityName, e) => {
    e.stopPropagation();
    const updatedFavourites = favouriteCities.filter(fav => fav.name !== cityName);
    setFavouriteCities(updatedFavourites);
    localStorage.setItem('favouriteCities', JSON.stringify(updatedFavourites));
  };

  const handleLogout = () => {
    // Ici vous pouvez ajouter la logique de déconnexion
    alert("Déconnexion réussie !");
    // Exemple: redirection, nettoyage de session, etc.
  };

  const toggleFavouritesView = () => {
    setShowFavourites(!showFavourites);
    setWeather(null);
  };

  return (
    <div className="app-container">
      {/* Header externe au conteneur */}
      <div className="external-header">
        <div className="header-links">
          <button 
            className="header-link favourites-link"
            onClick={toggleFavouritesView}
          >
             Villes favorites
          </button>
          <button 
            className="header-link logout-link"
            onClick={handleLogout}
          >
             Se déconnecter
          </button>
        </div>
      </div>

      <div className="app">
        <h1 className="title"> Weather App</h1>

        {!showFavourites ? (
          <>
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
                <div className="weather-card-header">
                  <div className="unit-toggle">
                    <button className="unit-button" onClick={toggleUnit}>
                      Switch to {unit === "celsius" ? "°F" : "°C"}
                    </button>
                  </div>
                  <FavouriteIcon 
                    city={{
                      name: weather.name,
                      country: weather.sys.country,
                      lat: weather.coord.lat,
                      lon: weather.coord.lon
                    }}
                    onFavouriteToggle={handleFavouriteToggle}
                  />
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
          </>
        ) : (
          /* Page des villes favorites */
          <div className="favourites-page">
            <h2 className="favourites-title">⭐ Mes Villes Favorites</h2>
            
            {favouriteCities.length === 0 ? (
              <div className="no-favourites">
                <p>Aucune ville favorite pour le moment</p>
                <button 
                  className="back-button"
                  onClick={() => setShowFavourites(false)}
                >
                  ← Retour à la recherche
                </button>
              </div>
            ) : (
              <>
                <div className="favourites-list-page">
                  {favouriteCities.map(fav => (
                    <div 
                      key={fav.name} 
                      className="favourite-item-page"
                      onClick={() => loadFavouriteCity(fav)}
                    >
                      <span className="favourite-city-name-page">
                        {fav.name}, {fav.country}
                      </span>
                      <div className="favourite-actions">
                        <button 
                          className="view-weather-btn"
                          onClick={() => loadFavouriteCity(fav)}
                        >
                          Voir météo
                        </button>
                        <button 
                          className="remove-favourite-page"
                          onClick={(e) => removeFavourite(fav.name, e)}
                          aria-label={`Remove ${fav.name} from favorites`}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <button 
                  className="back-button"
                  onClick={() => setShowFavourites(false)}
                >
                  ← Retour à la recherche
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;