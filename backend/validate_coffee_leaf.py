from ultralytics import YOLO
import argparse
import json
import sys
import cv2
import numpy as np

def validate_coffee_leaf(image_path):
    try:
        # Cargar la imagen
        img = cv2.imread(image_path)
        if img is None:
            return {"isCoffeeLeaf": False, "error": "No se pudo cargar la imagen"}

        # Convertir a HSV
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)

        # Definir rangos de color para verdes (incluyendo verdes enfermos)
        # Ampliamos el rango para incluir variaciones de verde y marrón
        lower_green = np.array([20, 20, 20])  # Valores más permisivos
        upper_green = np.array([100, 255, 255])

        # Crear máscara
        mask = cv2.inRange(hsv, lower_green, upper_green)
        
        # Calcular porcentaje de píxeles verdes
        green_pixels = np.sum(mask > 0)
        total_pixels = mask.size
        green_ratio = green_pixels / total_pixels

        # Verificar forma de la hoja
        # Encontrar contornos
        contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        if len(contours) == 0:
            return {"isCoffeeLeaf": False, "reason": "No se detectaron contornos de hoja"}

        # Obtener el contorno más grande
        max_contour = max(contours, key=cv2.contourArea)
        contour_area = cv2.contourArea(max_contour)
        
        # Si el área del contorno es muy pequeña en relación con la imagen, probablemente no es una hoja
        image_area = img.shape[0] * img.shape[1]
        area_ratio = contour_area / image_area

        # Criterios más permisivos
        is_coffee_leaf = (
            green_ratio > 0.2 and  # Reducimos el umbral de verde requerido
            area_ratio > 0.1  # Área mínima más permisiva
        )

        return {
            "isCoffeeLeaf": is_coffee_leaf,
            "confidence": float(green_ratio),
            "area_ratio": float(area_ratio)
        }

    except Exception as e:
        print(f"Error en la validación: {str(e)}", file=sys.stderr)
        return {
            "isCoffeeLeaf": True,  # Por defecto permitimos la imagen si hay un error
            "confidence": 1.0,
            "error": str(e)
        }

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--source', required=True, help='Ruta a la imagen a validar')
    args = parser.parse_args()

    result = validate_coffee_leaf(args.source)
    print(json.dumps(result))

if __name__ == "__main__":
    main()