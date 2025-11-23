import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { WiDaySunny, WiCloud, WiRain, WiSnow, WiStrongWind, WiHumidity, WiStrongWind as WiWind } from "react-icons/wi";
import "./App.css";
import FavouriteIcon from './FavouriteIcon';
import { weatherService, favoritesService } from '../services/api';

function Weather() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [unit, setUnit] = useState("celsius");
  const [favouriteCities, setFavouriteCities] = useState([]);
  const [showFavourites, setShowFavourites] = useState(false);
  const [isUpdatingFavourite, setIsUpdatingFavourite] = useState(false);

  const { logout, user } = useAuth();
  const navigate = useNavigate();

  // Charger les villes favorites depuis la DB
  useEffect(() => {
    const loadFavoritesFromDB = async () => {
      if (!user) {
        console.log('No user logged in, skipping favorites load');
        return;
      }
      
      try {
        console.log('Loading favorites for user:', user.id);
        const response = await favoritesService.getFavorites();
        console.log('Favorites loaded from DB:', response.data);
        setFavouriteCities(response.data || []);
      } catch (error) {
        console.error('Error loading favorites from DB:', error);
        // Only use localStorage as fallback for unauthenticated users
        if (!user) {
          const savedFavourites = JSON.parse(localStorage.getItem('favouriteCities') || '[]');
          setFavouriteCities(savedFavourites);
        }
      }
    };
    
    loadFavoritesFromDB();
  }, [user]);

  const getWeather = async () => {
    if (!city.trim()) {
      setError("Please enter a city name");
      setWeather(null);
      return;
    }
  
    setLoading(true);
    setError("");
  
    try {
      const response = await weatherService.getPublicWeather(city);
      console.log('Weather data received:', response.data);
      
      if (!response.data) {
        throw new Error('No data received from server');
      }
      
      setWeather(response.data);
      setShowFavourites(false);
    } catch (error) {
      console.error('Weather fetch error:', error);
      setError(error.response?.data?.error || error.message || "City not found");
      setWeather(null);
    }
    setLoading(false);
  };

  const getWeatherIcon = (description) => {
    const iconProps = { size: 80 };
    
    const desc = description?.toLowerCase() || '';
    
    if (desc.includes('dégagé') || desc.includes('clair') || desc.includes('clear')) {
      return <WiDaySunny {...iconProps} color="#FFD93D" />;
    } else if (desc.includes('nuage') || desc.includes('cloud')) {
      return <WiCloud {...iconProps} color="#B0BEC5" />;
    } else if (desc.includes('pluie') || desc.includes('rain')) {
      return <WiRain {...iconProps} color="#4FC3F7" />;
    } else if (desc.includes('neige') || desc.includes('snow')) {
      return <WiSnow {...iconProps} color="#90CAF9" />;
    } else {
      return <WiStrongWind {...iconProps} color="#4DB6AC" />;
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

  const handleFavouriteToggle = async (isFavourite, cityData) => {
    if (!cityData || !cityData.name || !user) {
      console.error("Erreur: Données de ville manquantes ou utilisateur non connecté", cityData, user);
      return;
    }
    
    if (isUpdatingFavourite) {
      console.log('Favourite update already in progress');
      return;
    }
    
    setIsUpdatingFavourite(true);
    
    try {
      if (isFavourite) {
        console.log('Adding favorite to DB:', cityData);
        // Send cityData directly without wrapping in {city: ...}
        await favoritesService.addFavorite({
          name: cityData.name,
          country: cityData.country,
          lat: cityData.lat,
          lon: cityData.lon
        });
      } else {
        console.log('Removing favorite from DB:', cityData.name);
        await favoritesService.removeFavorite(cityData.name);
      }
      
      // Wait a bit then reload favorites from DB
      setTimeout(async () => {
        try {
          const response = await favoritesService.getFavorites();
          console.log('Refreshed favorites after update:', response.data);
          setFavouriteCities(response.data || []);
        } catch (error) {
          console.error('Error refreshing favorites:', error);
        }
        setIsUpdatingFavourite(false);
      }, 500);
      
    } catch (error) {
      console.error('Error updating favorites:', error);
      setIsUpdatingFavourite(false);
      
      // Show detailed error to user
      setError(`Failed to ${isFavourite ? 'add' : 'remove'} favorite: ${error.response?.data?.message || error.message}`);
    }
  };

  const loadFavouriteCity = (favCity) => {
    const cityName = favCity.name || favCity.city_name;
    console.log('Loading favorite city:', cityName);
    setCity(cityName);
    setShowFavourites(false);
    
    // Use setTimeout to ensure state updates before API call
    setTimeout(() => {
      getWeather();
    }, 100);
  };

  const removeFavourite = async (cityName, e) => {
    e.stopPropagation();
    
    if (!user) {
      console.error('Cannot remove favorite: No user logged in');
      return;
    }
    
    try {
      console.log('Removing favorite:', cityName);
      await favoritesService.removeFavorite(cityName);
      
      // Update local state immediately for better UX
      setFavouriteCities(prev => prev.filter(fav => fav.name !== cityName));
      
      // Also reload from DB to ensure consistency
      setTimeout(async () => {
        try {
          const response = await favoritesService.getFavorites();
          setFavouriteCities(response.data || []);
        } catch (error) {
          console.error('Error refreshing after removal:', error);
        }
      }, 300);
      
    } catch (error) {
      console.error('Error removing favorite:', error);
      setError(`Failed to remove favorite: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
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
        <h1 className="title">Weather App</h1>

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
                      name: weather.city || 'Unknown',
                      country: weather.country || 'N/A',
                      lat: weather.lat,
                      lon: weather.lon
                    }}
                    onFavouriteToggle={handleFavouriteToggle}
                  />
                </div>

                <div className="weather-icon">
                  {getWeatherIcon(weather.description)}
                </div>
                
                <div className="weather-header">
                  <h2>{weather.city || 'Unknown'}, {weather.country || 'N/A'}</h2>
                  <h3>{weather.description || 'No description'}</h3>
                </div>
                
                <p className="temperature">
                  {convertTemp(weather.temperature || 0)}°{unit === "celsius" ? "C" : "F"}
                </p>
                
                <div className="weather-details">
                  <div className="detail-item">
                    <WiHumidity size={24} />
                    <span>{weather.humidity || 0}%</span>
                  </div>
                  <div className="detail-item">
                    <WiWind size={24} />
                    <span>{weather.windSpeed || weather.windspeed || 0} m/s</span>
                  </div>
                  <div className="detail-item">
                    <span>🌡️</span>
                    <span>{convertTemp(weather.feelsLike || weather.temperature || 0)}°</span>
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
                  {favouriteCities.map((fav, index) => (
                    <div 
                      key={`${fav.name}-${index}`} 
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

export default Weather;