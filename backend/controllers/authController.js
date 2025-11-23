import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { executeQuery } from "../config/database.js";
import { secrets } from "../config/keyVault.js";

const getJwtSecret = async () => {
  return await secrets.getJwtSecret();
};

export const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email et mot de passe requis" });
    }

    const existingUsers = await executeQuery(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: "Un utilisateur avec cet email existe déjà" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const jwtSecret = await getJwtSecret();

    // ✅ CORRECTION: Utiliser 'fullname' au lieu de 'name'
    const result = await executeQuery(
      'INSERT INTO users (email, password, fullname) VALUES (?, ?, ?)',
      [email, hashedPassword, name || '']
    );

    const token = jwt.sign(
      { id: result.insertId, email: email },
      jwtSecret,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: "Utilisateur créé avec succès",
      token,
      user: { 
        id: result.insertId, 
        email, 
        name: name || ''  // Garder 'name' dans la réponse API
      }
    });

  } catch (error) {
    console.error("Erreur inscription:", error);
    res.status(500).json({ error: "Erreur serveur lors de l'inscription" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email et mot de passe requis" });
    }

    const users = await executeQuery(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(400).json({ error: "Email ou mot de passe incorrect" });
    }

    const user = users[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ error: "Email ou mot de passe incorrect" });
    }

    const jwtSecret = await getJwtSecret();
    const token = jwt.sign(
      { id: user.id, email: user.email },
      jwtSecret,
      { expiresIn: '7d' }
    );

    res.json({
      message: "Connexion réussie",
      token,
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.fullname  // ✅ CORRECTION: Utiliser user.fullname
      }
    });

  } catch (error) {
    console.error("Erreur connexion:", error);
    res.status(500).json({ error: "Erreur serveur lors de la connexion" });
  }
};

export const getProfile = async (req, res) => {
  try {
    const users = await executeQuery(
      'SELECT id, email, fullname, created_at FROM users WHERE id = ?',  // ✅ CORRECTION: fullname
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    const user = users[0];
    res.json({
      id: user.id,
      email: user.email,
      name: user.fullname,  // ✅ CORRECTION: mapper fullname vers name
      created_at: user.created_at
    });

  } catch (error) {
    console.error("Erreur profile:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};