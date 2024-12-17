// Modal.jsx
import React from 'react';

const Modal = ({ isOpen, onClose, result }) => {
  if (!isOpen) return null; // Si no está abierto, no mostramos nada

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg max-w-lg w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800">Resultados del Análisis</h3>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
            &times;
          </button>
        </div>
        <div className="space-y-4">
          {result && result.success ? (
            result.results.detections.map((detection, index) => (
              <div key={index} className="p-4 border rounded-lg bg-gray-50">
                <h4 className="font-semibold text-gray-800">{detection.disease}</h4>
                <p className="text-sm text-gray-600">
                  {detection.count} {detection.count === 1 ? 'instancia detectada' : 'instancias detectadas'}
                </p>
              </div>
            ))
          ) : (
            <p className="text-gray-600">No se detectaron enfermedades en la imagen.</p>
          )}
        </div>
        <div className="mt-4 text-right">
          <button onClick={onClose} className="px-6 py-2 bg-green-600 text-white rounded-xl">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
