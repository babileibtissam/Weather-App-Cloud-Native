import mysql from 'mysql2/promise';
import { secrets } from './keyVault.js';

let connectionPool;

export const initDatabase = async () => {
    try {
      // Récupérer le mot de passe depuis Key Vault
      const dbPassword = await secrets.getDatabasePassword();
      
      const dbConfig = {
        host: process.env.AZURE_SQL_SERVER,
        database: process.env.AZURE_SQL_DATABASE,
        user: process.env.AZURE_SQL_USER,
        password: dbPassword, // ← Maintenant depuis Key Vault
        port: 3306,
        ssl: {
          rejectUnauthorized: false
        },
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        connectTimeout: 15000
      };
  
      console.log("🔧 Configuration MySQL avec Key Vault:");
      console.log("Host:", dbConfig.host);
      console.log("Database:", dbConfig.database);
      console.log("User:", dbConfig.user);
  
      connectionPool = mysql.createPool(dbConfig);
  
      // Test de connexion
      const testConnection = await connectionPool.getConnection();
      console.log("✅ Connecté à Azure MySQL Database via Key Vault");
      testConnection.release();
  
      await createTables();
      
      return connectionPool;
    } catch (error) {
      console.error("❌ Erreur connexion Azure MySQL:", error.message);
      throw error;
    }
};

const createTables = async () => {
  try {
    await connectionPool.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await connectionPool.execute(`
      CREATE TABLE IF NOT EXISTS favorite_cities (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        city_name VARCHAR(255) NOT NULL,
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_city (user_id, city_name),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await connectionPool.execute(`
      CREATE TABLE IF NOT EXISTS search_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        city_name VARCHAR(255) NOT NULL,
        searched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    console.log("✅ Tables MySQL créées/vérifiées");
  } catch (error) {
    console.error("❌ Erreur création tables:", error.message);
    throw error;
  }
};

export const getDatabase = () => {
  if (!connectionPool) {
    throw new Error("Database not initialized. Call initDatabase first.");
  }
  return connectionPool;
};

export const executeQuery = async (query, params = []) => {
  const db = getDatabase();
  try {
    const [rows] = await db.execute(query, params);
    return rows;
  } catch (error) {
    console.error("❌ Erreur requête MySQL:", error.message);
    throw error;
  }
};