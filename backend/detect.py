from ultralytics import YOLO
import sys
import argparse
import os

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--model', required=True, help='Path to model weights')
    parser.add_argument('--source', required=True, help='Path to input image')
    parser.add_argument('--project', default='results', help='Project directory')
    parser.add_argument('--name', default='predict', help='Name of output directory')
    parser.add_argument('--exist-ok', action='store_true', help='Existing project ok')
    parser.add_argument('--save-txt', action='store_true', help='Save results as .txt')
    parser.add_argument('--save-conf', action='store_true', help='Save confidences')
    args = parser.parse_args()

    try:
        # Cargar modelo
        model = YOLO(args.model)

        # Realizar predicción
        results = model.predict(
            source=args.source,
            project=args.project,
            name=args.name,
            exist_ok=True,  # Siempre permitir sobrescribir
            save=True,
            save_txt=args.save_txt,
            save_conf=args.save_conf
        )

        # Imprimir resultados
        for r in results:
            print(r.boxes.data.tolist())  # coordinates, confidence, class

    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()