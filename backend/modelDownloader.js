// modelDownloader.js
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const https = require('https');

async function downloadModel() {
  try {
    const modelLocalPath = path.join(__dirname, 'best.pt');
    
    // Si el modelo ya existe localmente, no lo descargamos de nuevo
    if (fs.existsSync(modelLocalPath)) {
      console.log('Modelo ya existe localmente');
      return modelLocalPath;
    }

    console.log('Descargando modelo desde Firebase Storage...');
    
    // Obtener URL firmada del modelo
    const bucket = admin.storage().bucket();
    const modelFile = bucket.file('models/best.pt');
    
    const [signedUrl] = await modelFile.getSignedUrl({
      action: 'read',
      expires: Date.now() + 15 * 60 * 1000, // URL válida por 15 minutos
    });

    // Descargar el modelo usando la URL firmada
    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(modelLocalPath);
      
      https.get(signedUrl, (response) => {
        response.pipe(file);
        
        file.on('finish', () => {
          file.close();
          console.log('Modelo descargado exitosamente');
          resolve(modelLocalPath);
        });
      }).on('error', (err) => {
        fs.unlink(modelLocalPath, () => {
          reject(err);
        });
      });
    });
  } catch (error) {
    console.error('Error al descargar el modelo:', error);
    throw error;
  }
}

module.exports = downloadModel;