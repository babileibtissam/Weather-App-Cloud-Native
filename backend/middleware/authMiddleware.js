import jwt from "jsonwebtoken";
import { secrets } from "../config/keyVault.js";

// Cache le JWT secret
let jwtSecretCache = null;

const getJwtSecret = async () => {
  if (!jwtSecretCache) {
    jwtSecretCache = await secrets.getJwtSecret();
    console.log('🔑 JWT Secret chargé depuis Key Vault');
  }
  return jwtSecretCache;
};

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: "Token d'accès requis" });
  }

  try {
    const jwtSecret = await getJwtSecret();
    
    // ✅ CORRECTION: Utiliser jwt.verify de manière synchrone
    jwt.verify(token, jwtSecret, (err, user) => {
      if (err) {
        console.log('❌ Token invalide:', err.message);
        return res.status(403).json({ error: "Token invalide" });
      }
      req.user = user;
      next();
    });
    
  } catch (error) {
    console.error('❌ Erreur récupération JWT secret:', error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};