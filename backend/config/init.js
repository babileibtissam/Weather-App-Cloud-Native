import { initDatabase } from "./database.js";
import { logger } from "../utils/logger.js";

export const initializeApp = async () => {
  try {
    logger.info("🔄 Initialisation des services Azure...");
    
    // Initialiser la base de données
    await initDatabase();
    
    logger.info("✅ Tous les services Azure initialisés");
  } catch (error) {
    logger.error("❌ Erreur initialisation:", error);
    process.exit(1);
  }
};