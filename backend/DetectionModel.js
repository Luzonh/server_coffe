
const tf = require('@tensorflow/tfjs-node');  // TensorFlow.js para Node.js
const jimp = require('jimp');  // Para procesamiento de imágenes

class DetectionModel {
    constructor(modelPath) {
        this.modelPath = modelPath;
        this.model = null;
    }

    // Cargar el modelo .tflite
    async loadModel() {
        if (!this.model) {
            this.model = await tf.loadGraphModel(`file://${this.modelPath}`);
        }
    }

    // Método para procesar la imagen y hacer la predicción
    async detectDisease(imagePath) {
        await this.loadModel();  // Asegúrate de que el modelo esté cargado

        // Cargar y preprocesar la imagen
        const image = await jimp.read(imagePath);
        image.resize(224, 224);  // Cambiar el tamaño de la imagen al tamaño esperado por el modelo

        const imageBuffer = await image.getBufferAsync(jimp.MIME_JPEG);  // Convertir la imagen a buffer
        const tensor = tf.node.decodeImage(imageBuffer)  // Decodificar la imagen en un tensor
            .expandDims(0)  // Añadir dimensión para batch (batch size = 1)
            .toFloat()
            .div(255.0);  // Normalizar los píxeles

        // Hacer predicción
        const prediction = await this.model.predict(tensor).data();

        // Aquí asumimos que el modelo devuelve un array de probabilidades para diferentes clases
        const diseases = ['roya', 'ojo de gallo', 'antracnosis', 'miner'];
        const highestProbIndex = prediction.indexOf(Math.max(...prediction));  // Obtener el índice con la mayor probabilidad
        return diseases[highestProbIndex];  // Devolver la enfermedad con mayor probabilidad
    }
}

module.exports = DetectionModel;
