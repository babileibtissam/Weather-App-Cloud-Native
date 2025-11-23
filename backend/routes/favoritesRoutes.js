import express from 'express';
import { getDatabase } from '../config/database.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET - Récupérer les villes favorites de l'utilisateur
router.get('/', authenticateToken, async (req, res) => {
  try {
    const db = getDatabase();
    const [favorites] = await db.execute(
      'SELECT id, city_name as name, added_at FROM favorite_cities WHERE user_id = ? ORDER BY added_at DESC',
      [req.user.id]
    );
    res.json(favorites);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST - Ajouter une ville favorite
router.post('/', authenticateToken, async (req, res) => {
  const { name, country, lat, lon } = req.body;
  
  try {
    const db = getDatabase();
    
    // Vérifier si la ville existe déjà
    const [existing] = await db.execute(
      'SELECT * FROM favorite_cities WHERE user_id = ? AND city_name = ?',
      [req.user.id, name]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ error: 'City already in favorites' });
    }
    
    // Ajouter la ville favorite
    const [result] = await db.execute(
      'INSERT INTO favorite_cities (user_id, city_name) VALUES (?, ?)',
      [req.user.id, name]
    );
    
    res.json({ 
      message: 'City added to favorites',
      id: result.insertId 
    });
  } catch (error) {
    console.error('Error adding favorite:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE - Supprimer une ville favorite
router.delete('/:cityName', authenticateToken, async (req, res) => {
  const cityName = req.params.cityName;
  
  try {
    const db = getDatabase();
    const [result] = await db.execute(
      'DELETE FROM favorite_cities WHERE user_id = ? AND city_name = ?',
      [req.user.id, cityName]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Favorite city not found' });
    }
    
    res.json({ message: 'City removed from favorites' });
  } catch (error) {
    console.error('Error removing favorite:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;