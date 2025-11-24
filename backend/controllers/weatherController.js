import fetch from "node-fetch";
import { executeQuery } from "../config/database.js";
import { secrets } from "../config/keyVault.js";
import blobStorageService from "../services/blobStorage.js";

const getApiKey = async () => {
  return await secrets.getOpenWeatherApiKey();
};

// Fonction pour enrichir avec l'URL Blob Storage
const enrichWeatherData = async (weatherData) => {
  try {
    const iconUrl = await blobStorageService.getWeatherIconUrl(weatherData.icon);
    return {
      ...weatherData,
      iconUrl: iconUrl // URL Azure Blob Storage ou fallback OpenWeather
    };
  } catch (error) {
    console.error('Error enriching weather data:', error);
    return {
      ...weatherData,
      iconUrl: `https://openweathermap.org/img/wn/${weatherData.icon}@2x.png`
    };
  }
};

export const getWeather = async (req, res) => {
  try {
    const city = req.query.city;

    if (!city) {
      return res.status(400).json({ error: "Nom de ville requis" });
    }

    const apiKey = await getApiKey();

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=fr`
    );

    if (!response.ok) {
      return res.status(404).json({ error: "Ville non trouvée" });
    }

    const data = await response.json();
    
    const formattedData = {
      city: data.name,
      temperature: Math.round(data.main.temp),
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      country: data.sys.country,
      lat: data.coord.lat,
      lon: data.coord.lon
    };

    // ✅ ENRICHISSEMENT AVEC BLOB STORAGE
    const enrichedData = await enrichWeatherData(formattedData);

    try {
      await executeQuery(
        'INSERT INTO search_history (user_id, city_name) VALUES (?, ?)',
        [req.user.id, city]
      );
    } catch (historyErr) {
      console.error("Erreur sauvegarde historique:", historyErr);
    }

    res.json(enrichedData);
  } catch (err) {
    console.error("Error fetching weather:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// Gardez votre fonction publique existante
export const getPublicWeather = async (req, res) => {
  try {
    const city = req.query.city;
    
    if (!city) {
      return res.status(400).json({ error: "Nom de ville requis" });
    }

    const apiKey = await getApiKey();

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=fr`
    );

    if (!response.ok) {
      return res.status(404).json({ error: "Ville non trouvée" });
    }

    const data = await response.json();
    
    const formattedData = {
      city: data.name,
      temperature: Math.round(data.main.temp),
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      country: data.sys.country,
      lat: data.coord.lat,
      lon: data.coord.lon
    };

    // ✅ ENRICHISSEMENT AVEC BLOB STORAGE
    const enrichedData = await enrichWeatherData(formattedData);

    res.json(enrichedData);
  } catch (err) {
    console.error("Error fetching public weather:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};