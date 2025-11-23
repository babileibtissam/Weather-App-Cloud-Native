import express from "express";
import cors from "cors";
import { initDatabase } from "./config/database.js";
import authRoutes from "./routes/authRoutes.js";
import weatherRoutes from "./routes/weatherRoutes.js";
import favoriteRoutes from "./routes/favoritesRoutes.js";

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/weather", weatherRoutes);
app.use('/api/favorites', favoriteRoutes);

// Route météo publique (pour les tests sans auth)
app.get("/weather", async (req, res) => {
  try {
    const city = req.query.city;
    
    if (!city) {
      return res.status(400).json({ error: "Nom de ville requis" });
    }

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=dbc04b17b8d37375e1ae8822db812fde&units=metric&lang=fr`
    );

    if (!response.ok) {
      return res.status(404).json({ error: "Ville non trouvée" });
    }

    const data = await response.json();
    
    res.json({
      city: data.name,
      temperature: Math.round(data.main.temp),
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      country: data.sys.country
    });
  } catch (err) {
    console.error("Error fetching weather:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Health check
app.get("/api/health", async (req, res) => {
  res.json({ 
    status: "OK", 
    message: "Serveur opérationnel",
    timestamp: new Date().toISOString()
  });
});

// Route de test
app.get("/api/test", (req, res) => {
  res.json({ 
    message: "✅ Backend MySQL opérationnel",
    version: "1.0.0",
    timestamp: new Date().toISOString()
  });
});

// Démarrer le serveur
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await initDatabase();
    
    app.listen(PORT, () => {
      console.log(`\n🎉 Serveur démarré avec succès!`);
      console.log(`📍 Port: ${PORT}`);
      console.log(`🌐 Health: http://localhost:${PORT}/api/health`);
      console.log(`🧪 Test: http://localhost:${PORT}/api/test`);
      console.log(`🌤️  Météo test: http://localhost:${PORT}/weather?city=Paris`);
    });
  } catch (error) {
    console.error("❌ Impossible de démarrer le serveur:", error.message);
    console.log("💡 Le serveur démarre mais sans base de données");
    
    // Démarrer quand même le serveur pour les tests
    app.listen(PORT, () => {
      console.log(`\n⚠️  Serveur démarré SANS base de données`);
      console.log(`📍 Port: ${PORT}`);
      console.log(`🌐 Health: http://localhost:${PORT}/api/health`);
    });
  }
};

startServer();