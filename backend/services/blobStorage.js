import { BlobServiceClient } from "@azure/storage-blob";
import { secrets } from "../config/keyVault.js";

class BlobStorageService {
  constructor() {
    this.isInitialized = false;
    this.accountName = 'meteoweatherstorage';
  }

  async initialize() {
    if (this.isInitialized) return true;

    try {
      this.connectionString = await secrets.getAzureStorageConnectionString();
      
      if (!this.connectionString) {
        console.log('⚠️  Azure Storage connection string not found in Key Vault, using OpenWeather icons');
        return false;
      }
      
      this.blobServiceClient = BlobServiceClient.fromConnectionString(this.connectionString);
      this.containerClient = this.blobServiceClient.getContainerClient("weather-icons");
      
      // Crée le container s'il n'existe pas
      await this.containerClient.createIfNotExists({ 
        access: 'blob' // Public read access
      });
      
      console.log('✅ Azure Blob Storage initialized successfully');
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Azure Blob Storage:', error.message);
      return false;
    }
  }

  async getWeatherIconUrl(iconCode) {
    // Initialise au premier appel
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.blobServiceClient) {
      // Fallback vers OpenWeather si Blob Storage n'est pas initialisé
      return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    }
    
    try {
      return `https://${this.accountName}.blob.core.windows.net/weather-icons/${iconCode}.png`;
    } catch (error) {
      console.error('Error generating Blob Storage URL:', error);
      return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    }
  }
}

export default new BlobStorageService();