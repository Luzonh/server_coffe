const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const admin = require('firebase-admin');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const downloadModel = require('./modelDownloader');

// Firebase Admin SDK Configuration
try {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT ? 
  JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT) : 
  require('./model/ia-coffee-firebase-adminsdk-q1d9k-4f2ffee.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'ia-coffee.appspot.com'
});
} catch (error) {
  console.error('Error al inicializar Firebase Admin:', error);
  // Si hay un error al cargar el archivo, intentamos usar las variables de entorno
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'ia-coffee.appspot.com'
    });
  } else {
    console.error('No se pudo inicializar Firebase Admin');
  }
}

const app = express();

// Configuración CORS
app.use(cors({
  origin: ['https://ia-coffee.web.app', 'https://ia-coffee.firebaseapp.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200,
  maxAge: 86400 
}));

// Headers CORS adicionales
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Middleware básico
app.use(express.json());

// Inicializar servicios de Firebase
const firestore = admin.firestore();
const storageBucket = admin.storage().bucket();
const auth = admin.auth();

// Configurar directorios
const baseDir = __dirname;
const uploadsDir = path.join(baseDir, 'uploads');
const resultsDir = path.join(baseDir, 'results');
const modelDir = path.join(baseDir, 'model');

// Crear directorios necesarios
[uploadsDir, resultsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Middleware de autenticación
async function authenticateUser(req, res, next) {
  try {
    const idToken = req.headers.authorization?.split('Bearer ')[1];
    if (!idToken) {
      return res.status(403).json({ error: 'No token provided' });
    }

    try {
      const decodedToken = await auth.verifyIdToken(idToken);
      req.user = {
        email: decodedToken.email,
        name: decodedToken.name || decodedToken.email.split('@')[0],
        uid: decodedToken.uid
      };
      next();
    } catch (verifyError) {
      console.error('Token verification error:', verifyError);
      return res.status(403).json({ error: 'Invalid token' });
    }
  } catch (error) {
    console.error('Auth Error:', error);
    return res.status(403).json({ error: 'Authentication failed' });
  }
}

// Función para obtener temperatura basada en la enfermedad
async function getTemperatureForDisease(disease) {
  const temperatureRanges = {
    'roya': '20-25°C',
    'ojo de gallo': '18-22°C',
    'minador': '22-28°C'
  };
  return temperatureRanges[disease] || null;
}

// Servicio de localización
async function getCurrentLocation() {
  try {
    const response = await axios.get('https://ipapi.co/json/');
    return {
      latitude: response.data.latitude,
      longitude: response.data.longitude,
      city: response.data.city,
      country: response.data.country
    };
  } catch (error) {
    console.error('Error getting location:', error);
    return {
      latitude: 0,
      longitude: 0,
      city: 'Unknown',
      country: 'Unknown'
    };
  }
}

// Configuración de multer para subida de archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB máximo
  },
  fileFilter: function(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
      return cb(new Error('Solo se permiten archivos de imagen.'));
    }
    cb(null, true);
  }
});

// Función para parsear detecciones del modelo
function parseDetections(result) {
  const detections = [];
  const lines = result.split('\n');
  
  for (const line of lines) {
    if (line.includes('ojo de gallo') || line.includes('roya') || line.includes('minador')) {
      const matches = line.match(/(\d+)\s+(ojo de gallo|roya|minador)/);
      if (matches) {
        detections.push({
          disease: matches[2],
          count: parseInt(matches[1])
        });
      }
    }
  }
  
  return detections;
}

// Función para guardar datos de detección en Firebase
async function saveDetectionData(user, detections, processedImagePath) {
  try {
    const timestamp = Date.now();
    const currentDate = new Date();
    const dateFormatter = currentDate.toISOString().split('T')[0];
    const timeFormatter = currentDate.toTimeString().split(' ')[0];

    const detectionData = {
      user: user.email || 'Correo Desconocido',
      userName: user.name || 'Nombre Desconocido',
      detectedLabel: detections.length > 0 ? detections[0].disease : null,
      temperature: detections.length > 0 ? await getTemperatureForDisease(detections[0].disease) : null,
      location: await getCurrentLocation(),
      date: dateFormatter,
      time: timeFormatter,
      detections: detections
    };

    if (processedImagePath) {
      const destination = `detections/${timestamp}.jpg`;
      await storageBucket.upload(processedImagePath, {
        destination: destination,
        metadata: {
          contentType: 'image/jpeg'
        }
      });

      const [url] = await storageBucket.file(destination).getSignedUrl({
        version: 'v4',
        action: 'read',
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000 // URL válida por 7 días
      });

      detectionData.imageUrl = url;
    }

    const docRef = await firestore.collection('detections').add(detectionData);
    
    return {
      ...detectionData,
      id: docRef.id
    };
  } catch (error) {
    console.error('Error saving detection:', error);
    throw error;
  }
}

// Servir archivos estáticos
app.use('/uploads', express.static(uploadsDir));
app.use('/results', express.static(resultsDir));

// Ruta de detección
app.post('/detect', cors(), authenticateUser, upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const modelPath = await downloadModel();
    const inputPath = req.file.path;
    const timestamp = Date.now();

    // Definir y crear solo la carpeta predict si no existe
    const predictDir = path.join(resultsDir, 'predict');
    if (!fs.existsSync(predictDir)) {
      fs.mkdirSync(predictDir, { recursive: true });
    }

    // Eliminar cualquier carpeta predict adicional que pueda existir
    fs.readdirSync(resultsDir).forEach(folder => {
      if (folder.startsWith('predict') && folder !== 'predict') {
        const folderPath = path.join(resultsDir, folder);
        if (fs.existsSync(folderPath)) {
          fs.rmSync(folderPath, { recursive: true, force: true });
        }
      }
    });

    // Siempre usar el mismo nombre de archivo
    const originalPath = path.join(predictDir, 'original.jpg');

    // Sobrescribir el archivo existente
    fs.copyFileSync(inputPath, originalPath);

    // Ejecutar el modelo de detección usando la imagen original
    const pythonProcess = spawn('python', [
      path.join(baseDir, 'detect.py'),
      '--model', path.join(baseDir, 'best.pt'),
      '--source', originalPath,
      '--project', resultsDir,
      '--name', 'predict', // Forzar el uso de la carpeta 'predict'
      '--exist-ok',  // Sobrescribir archivos existentes
      '--save-txt',
      '--save-conf'
    ]);

    let result = '';
    let error = '';

    pythonProcess.stdout.on('data', (data) => {
      result += data.toString();
      console.log('Python output:', data.toString());
    });

    pythonProcess.stderr.on('data', (data) => {
      error += data.toString();
      console.error('Python error:', data.toString());
    });

    pythonProcess.on('close', async (code) => {
      // Limpiar archivo temporal del upload
      if (fs.existsSync(inputPath)) {
        fs.unlinkSync(inputPath);
      }

      if (code !== 0) {
        return res.status(500).json({
          success: false,
          error: error || 'Error processing image'
        });
      }

      const detections = parseDetections(result);

      try {
        const savedDetection = await saveDetectionData(
          req.user, 
          detections, 
          originalPath
        );

        res.json({
          success: true,
          imagePath: `/results/predict/original.jpg?t=${timestamp}`,
          results: {
            detections: detections,
            detection: savedDetection,
            raw: result
          }
        });
      } catch (saveError) {
        console.error('Save Error:', saveError);
        res.status(500).json({
          success: false,
          error: 'Error saving detection data',
          details: saveError.message
        });
      }
    });
  } catch (error) {
    console.error('Error in detection:', error);
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Ruta de prueba
app.get('/test', (req, res) => {
  res.json({ message: 'Server is running correctly' });
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: err.message
  });
});

// Configuración del puerto y inicio del servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});