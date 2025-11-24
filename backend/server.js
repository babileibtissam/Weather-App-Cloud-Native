const express = require('express');
const app = express();

// CORS ABSOLU
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

app.use(express.json());

// Route santé
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend simple opérationnel',
    timestamp: new Date().toISOString()
  });
});

// Route login simple
app.post('/api/auth/login', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Login réussi',
    token: 'test-token-123',
    user: { id: 1, email: req.body.email }
  });
});

// Route météo simple
app.get('/weather', async (req, res) => {
  const city = req.query.city;
  
  // Logique météo simple ou mock data
  res.json({
    city: city || 'Paris',
    temperature: 20,
    description: 'ensoleillé',
    country: 'FR'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Backend simple démarré sur le port ${PORT}`);
});