import React, { useState } from 'react';
import './styles/UploadImage.css';
import { 
  Upload, 
  AlertCircle, 
  RefreshCw, 
  CheckCircle, 
  Camera, 
  Loader2, 
  Leaf, 
  ChevronDown, 
  ChevronUp,
  X 
} from 'lucide-react';
import { auth } from './firebase';

// Componente ImagePreview
const ImagePreview = ({ src, alt, className }) => {
  return (
    <div className="relative w-full">
      <div className="w-full aspect-square rounded-lg overflow-hidden bg-gray-100">
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-contain"
          style={{
            maxWidth: '225px',
            maxHeight: '225px',
            margin: '0 auto'
          }}
        />
      </div>
    </div>
  );
};

// Componente para mostrar el estado del análisis
const AnalysisStatus = ({ loading, error, result }) => {
  if (loading) {
    return (
      <div className="absolute top-4 right-4 bg-white py-2 px-4 rounded-full shadow-lg flex items-center space-x-2 animate-pulse">
        <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
        <span className="text-sm font-medium text-gray-600">Analizando...</span>
      </div>
    );
  }
  return null;
};

// Modal de Resultados
const DiseaseInfo = ({ disease }) => {
  const [expanded, setExpanded] = useState(false);

  const getInfo = (diseaseName) => {
    switch(diseaseName) {
      case 'roya':
        return {
          title: '¡Enfermedad detectada!',
          content: `¡Puede reducir la producción de café hasta un 40%!

¿Cómo afecta el roya?

Imagina que las hojas del café son como los pulmones de la planta. La roya es como una neumonía que dificulta la respiración de la planta, debilitándola

¿Cómo combatir el roya?

Combatir la roya es como cuidar un jardín en casa: hay que mantener las plantas limpias, bien alimentadas y vigilarlas regularmente para detectar cualquier problema temprano.

Incidencia en los cultivos de café: 40-60%
Impacto en la producción: 20-40%
Reducción en la calidad del café: 15-25%`
        };
      case 'antracnosis':
        return {
          title: '¡Enfermedad detectada!',
          content: `¡Puede reducir la producción de café hasta un 25%!

¿Cómo afecta la antracnosis?

Imagina que los granos de café son como las frutas en un árbol. La antracnosis es como una plaga que pudre las frutas antes de que maduren, dejando al agricultor con menos cosecha y frutos de menor calidad.

¿Cómo combatir la antracnosis?

Combatir la antracnosis es como cuidar un huerto: hay que mantener las plantas sanas, protegerlas de la humedad excesiva y estar atento a los primeros signos de la enfermedad para actuar rápidamente.

Incidencia en los cultivos de café: 30-40%
Impacto en la producción total: 15-25%
Reducción en el puntaje de taza: 10-15%`
        };
      case 'ojo de gallo':
        return {
          title: '¡Enfermedad detectada!',
          content: `¡Puede reducir la producción de café hasta un 20%!

¿Cómo afecta el ojo de gallo?

Imagina que las hojas del café son como paneles solares para la planta. El ojo de gallo es como una sombra que cubre estos paneles, reduciendo la energía que la planta puede obtener del sol y debilitándola.

¿Cómo combatir el ojo de gallo?

Combatir el ojo de gallo es como mantener limpia una ventana: hay que asegurar que las hojas reciban suficiente luz, mantener el ambiente seco y eliminar las partes afectadas para evitar que se propague.

Incidencia en los cultivos de café: 25-35%
Impacto en la producción: 10-20%
Reducción en la calidad del café: 5-10%`
        };
      case 'minador':
        return {
          title: '¡Enfermedad detectada!',
          content: `¡Puede reducir la producción de café hasta un 12%!

¿Cómo afecta el minador de la hoja?

Imagina que las hojas del café son como las páginas de un libro. El minador es como una polilla que come estas páginas, dejando rastros y agujeros que dificultan la lectura (o en este caso, la capacidad de la planta para hacer fotosíntesis).

¿Cómo combatir el minador de la hoja?

Combatir el minador de la hoja es como proteger una biblioteca: hay que vigilar constantemente, introducir depredadores naturales que se coman a las polillas, y a veces, retirar los libros (hojas) más dañados para proteger al resto.

Infestación en las plantaciones: 20-30%
Reducción en la capacidad fotosintética: 15-25%
Impacto en la producción: 8-12%`
        };
      default:
        return {
          title: 'Información no disponible',
          content: 'No hay información detallada disponible para esta enfermedad.'
        };
    }
  };

  const info = getInfo(disease);
  const firstParagraph = info.content.split('\n\n')[0];
  
  return (
    <div className="bg-white rounded-lg mt-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-4 hover:bg-gray-50 transition-colors rounded-lg"
      >
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{info.title}</h3>
            <p className="text-sm text-gray-600">{firstParagraph}</p>
          </div>
          {expanded ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </div>
      </button>
      
      {expanded && (
        <div className="p-4 text-gray-600 whitespace-pre-line">
          {info.content.split('\n\n').slice(1).join('\n\n')}
        </div>
      )}
    </div>
  );
};

const ResultModal = ({ isOpen, onClose, result }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-40"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: '20px'
      }}
    >
      <div 
        className="bg-white rounded-xl shadow-xl relative overflow-y-auto"
        style={{
          width: '65%',
          height: '65%',
          maxWidth: '800px',
          animation: 'fade-in-down 0.5s ease-in-out'
        }}
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-6">
          <div className="text-center mb-6">
            <Leaf className="w-12 h-12 mx-auto text-green-600 mb-4" />
            <h2 className="text-xl font-bold text-gray-800">Resultados del Análisis</h2>
          </div>

          <div className="space-y-4">
            {/* Detecciones con acordeón */}
            <div className="space-y-2">
              {result.results.detections.map((detection, index) => (
                <div key={index} className="rounded-lg bg-white shadow-sm">
                  <div className="flex items-center space-x-2 p-4">
                    <span className="text-2xl">
                      {detection.disease === 'ojo de gallo' ? '🍂' : 
                       detection.disease === 'roya' ? '🌿' : 
                       detection.disease === 'minador' ? '🌱' : '🍃'}
                    </span>
                    <div>
                      <p className="font-semibold capitalize text-gray-800">
                        {detection.disease}
                      </p>
                      <p className="text-sm text-gray-600">
                        {detection.count} {detection.count === 1 ? 'instancia detectada' : 'instancias detectadas'}
                      </p>
                    </div>
                  </div>
                  <DiseaseInfo disease={detection.disease} />
                </div>
              ))}
            </div>

            {/* Imagen */}
            <div className="mt-6 text-center">
              <h4 className="text-sm font-medium text-gray-600 mb-2">
                Imagen Analizada
              </h4>
              <div className="flex justify-center">
                <div className="relative">
                  <img
                    src={`https://cafe-disease-detector.onrender.com${result.imagePath}`}
                    alt="Analyzed"
                    className="rounded-lg shadow-lg"
                    style={{ 
                      maxWidth: '100%',
                      height: 'auto',
                      maxHeight: '200px',
                      objectFit: 'contain'
                    }}
                    key={result.imagePath}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-center mt-6">
              <button 
                onClick={onClose}
                className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 
                hover:from-green-600 hover:to-emerald-700 text-white rounded-lg 
                shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const UploadImage = ({ user }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  
  const [retryCount, setRetryCount] = useState(0);
  const [currentStatus, setCurrentStatus] = useState('idle'); // Añade este
  const [uploadProgress, setUploadProgress] = useState(0);    // Añade este
  const [analysisProgress, setAnalysisProgress] = useState(0);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setResult(null);
      setError(null);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile || loading) {
      return;
    }
  
    try {
      setLoading(true);
      setError(null);
      setCurrentStatus('starting');
      console.log('Iniciando conexión al servidor...');
  
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Usuario no autenticado');
      }
  
      const token = await currentUser.getIdToken();
      const formData = new FormData();
      formData.append('image', selectedFile);
  
      // URL del servidor en producción
      const apiUrl = 'https://cafe-disease-detector.onrender.com/detect';
      
      setCurrentStatus('uploading');
      setUploadProgress(0);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
        mode: 'cors',
        credentials: 'include',
        cache: 'no-cache'
      });
  
      if (!response.ok) {
        const errorBody = await response.text();
        console.error('Error respuesta servidor:', {
          status: response.status,
          statusText: response.statusText,
          body: errorBody
        });
        throw new Error(`Error del servidor: ${response.status}`);
      }
  
      setCurrentStatus('analyzing');
      setAnalysisProgress(50);
  
      const data = await response.json();
      console.log('Respuesta del servidor:', data);
      
      if (data.success) {
        setCurrentStatus('complete');
        setAnalysisProgress(100);
        setResult(data);
        setIsResultModalOpen(true);
      } else {
        throw new Error(data.error || 'Error en el procesamiento de la imagen');
      }
  
    } catch (err) {
      console.error('Error detallado:', err);
      setCurrentStatus('error');
      
      let errorMessage = 'Error de conexión. Por favor, intente nuevamente.';
      
      if (err.message.includes('NetworkError') || err.message.includes('Failed to fetch')) {
        errorMessage = 'No se puede conectar al servidor. Por favor, verifique su conexión a internet.';
      } else if (err.message.includes('cors')) {
        errorMessage = 'Error de acceso al servidor. Por favor, contacte al administrador.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
      setTimeout(() => {
        setCurrentStatus('idle');
        setUploadProgress(0);
        setAnalysisProgress(0);
      }, 2000);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    const fileInput = document.getElementById('file-upload');
    if (fileInput) fileInput.value = '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50/50 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 text-white mb-4 shadow-lg">
            <Leaf className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Detector de Enfermedades en Café</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Sistema avanzado de detección de enfermedades en plantas de café mediante inteligencia artificial
          </p>
        </div>

        {/* Main Container */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Left Panel - Upload */}
            <div className="relative p-6 lg:p-8 bg-gradient-to-br from-gray-50 to-white border-b lg:border-b-0 lg:border-r border-gray-100">
              <div className="space-y-6">
                {/* Upload Area */}
                <div className="relative">
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    accept="image/*"
                    className="hidden"
                    id="file-upload"
                  />
                  
                  {!preview ? (
                    <label 
                      htmlFor="file-upload" 
                      className="block aspect-square rounded-2xl border-2 border-dashed border-gray-300 hover:border-green-500 transition-colors duration-300 cursor-pointer bg-gray-50 hover:bg-gray-50/80"
                    >
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <Camera className="w-16 h-16 text-gray-400" />
                        <p className="mt-4 text-sm text-gray-500 text-center">
                          <span className="font-medium text-green-600 hover:text-green-500">
                            Cargar imagen
                          </span>
                          {' '}o arrastrar y soltar
                        </p>
                        <p className="mt-2 text-xs text-gray-400">
                          PNG, JPG hasta 10MB
                        </p>
                      </div>
                    </label>
                  ) : (
                    <div className="relative group">
                      <div className="aspect-square">
                        <ImagePreview
                          src={preview}
                          alt="Preview"
                          className="rounded-lg"
                        />
                      </div>
                      <label 
                        htmlFor="file-upload"
                        className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-all duration-300 rounded-2xl"
                      >
                        <div className="text-white text-center">
                          <Upload className="w-8 h-8 mx-auto" />
                          <span className="mt-2 block">Cambiar imagen</span>
                        </div>
                      </label>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={handleSubmit}
                    disabled={!selectedFile || loading}
                    className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      !selectedFile || loading
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl focus:ring-green-500'
                    }`}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        <span>Procesando...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        <span>Analizar Imagen</span>
                      </div>
                    )}
                  </button>
                  
                  {(preview || result) && (
                    <button
                      onClick={handleReset}
                      className="px-4 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200"
                    >
                      <RefreshCw className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {error && (
                  <div className="rounded-xl p-4 bg-red-50 border border-red-100">
                    <div className="flex items-center text-red-800">
                      <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                      <p className="text-sm font-medium">{error}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel - Results (simplified) */}
            <div className="p-6 lg:p-8">
              <div className="h-full flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <Camera className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>Carga una imagen para ver los resultados del análisis</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          Desarrollado con tecnología de detección avanzada para identificar enfermedades en plantas de café
        </div>
      </div>

      <AnalysisStatus loading={loading} error={error} result={result} />

      {/* Modal de Resultados */}
      <ResultModal 
        isOpen={isResultModalOpen && result && result.success}
        onClose={() => {
          setIsResultModalOpen(false);
          handleReset();
        }}
        result={result}
      />
    </div>
  );
};

export default UploadImage;