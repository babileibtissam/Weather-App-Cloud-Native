// Logger simple pour les tests - version simplifiée sans Application Insights
const logger = {
    info: (message) => {
      console.log(`📝 [INFO] ${new Date().toISOString()}: ${message}`);
    },
    
    error: (message, error = null) => {
      console.error(`❌ [ERROR] ${new Date().toISOString()}: ${message}`);
      if (error) {
        console.error('   Détails:', error.message || error);
      }
    },
    
    warn: (message) => {
      console.warn(`⚠️ [WARN] ${new Date().toISOString()}: ${message}`);
    },
    
    debug: (message) => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`🐛 [DEBUG] ${new Date().toISOString()}: ${message}`);
      }
    }
  };
  
  export { logger };