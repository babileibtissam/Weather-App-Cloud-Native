import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = ""; // Replace this with your key

app.get("/weather", async (req, res) => {
  const city = req.query.q;

  if (!city) {
    return res.status(400).json({ error: "City is required" });
  }

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
    );

    if (!response.ok) {
      return res.status(response.status).json({ error: "City not found" });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Error fetching weather:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

app.listen(5000, () => console.log("✅ Server running on port 5000"));
