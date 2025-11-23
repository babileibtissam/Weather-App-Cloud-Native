import fetch from "node-fetch";
import { executeQuery } from "../config/database.js";
import { secrets } from "../config/keyVault.js";

const getApiKey = async () => {
  return await secrets.getOpenWeatherApiKey();
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
      country: data.sys.country
    };

    try {
      await executeQuery(
        'INSERT INTO search_history (user_id, city_name) VALUES (?, ?)',
        [req.user.id, city]
      );
    } catch (historyErr) {
      console.error("Erreur sauvegarde historique:", historyErr);
    }

    res.json(formattedData);
  } catch (err) {
    console.error("Error fetching weather:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};