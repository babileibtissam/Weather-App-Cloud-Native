import { DefaultAzureCredential } from "@azure/identity";
import { SecretClient } from "@azure/keyvault-secrets";

const keyVaultName = process.env.AZURE_KEY_VAULT_NAME;
const keyVaultUrl = `https://${keyVaultName}.vault.azure.net`;

const credential = new DefaultAzureCredential();
const secretClient = new SecretClient(keyVaultUrl, credential);

export const getSecret = async (secretName) => {
  try {
    console.log(`🔑 Récupération du secret: ${secretName} depuis Key Vault`);
    const secret = await secretClient.getSecret(secretName);
    console.log(`✅ Secret ${secretName} récupéré avec succès`);
    return secret.value;
  } catch (error) {
    console.error(`❌ Erreur récupération secret ${secretName}:`, error.message);
    
    // Fallback aux variables d'environnement pour le développement
    const fallbackSecrets = {
      'OpenWeatherApiKey': process.env.OPENWEATHER_API_KEY,
      'JwtSecret': process.env.JWT_SECRET,
      'DatabasePassword': process.env.AZURE_SQL_PASSWORD
    };
    
    if (fallbackSecrets[secretName]) {
      console.log(`⚠️ Utilisation fallback pour ${secretName}`);
      return fallbackSecrets[secretName];
    }
    
    throw new Error(`Secret ${secretName} non trouvé et pas de fallback disponible`);
  }
};

// Fonctions spécifiques pour chaque secret
export const secrets = {
  getOpenWeatherApiKey: () => getSecret('OpenWeatherApiKey'),
  getJwtSecret: () => getSecret('JwtSecret'),
  getDatabasePassword: () => getSecret('DatabasePassword')
};