"""
PenchGuard AI — Standalone Python Inference Server
Uses Python standard library (http.server) + Ultralytics YOLO (best.pt)
Exposes GET /api/status and POST /api/detect on http://localhost:8000
"""

import os
import sys
import json
import time
import re
from http.server import HTTPServer, BaseHTTPRequestHandler

# Import Ultralytics
try:
    from ultralytics import YOLO
    from PIL import Image
    import io
except ImportError as e:
    print(f"❌ Missing Python dependency: {e}")

MODEL_SEARCH_PATHS = [
    "models/best.pt",
    "models/last.pt",
    "models/yolo26n.pt",
    "C:/Users/VICTUS/OneDrive/Desktop/tiger train dataset/yolo26n.pt",
    "C:/Users/VICTUS/OneDrive/Desktop/tiger train dataset/runs/detect/tigers2_train/weights/best.pt",
    "C:/Users/VICTUS/OneDrive/Documents/GitHub/Animal-Intrusion-Detection/yolov5/best.pt"
]

yolo_model = None
connected_model_path = None

def load_model():
    global yolo_model, connected_model_path
    for path in MODEL_SEARCH_PATHS:
        if os.path.exists(path):
            try:
                print(f"🔄 Loading YOLO model from: {path}")
                yolo_model = YOLO(path)
                connected_model_path = os.path.abspath(path)
                print(f"✅ SUCCESSFULLY LOADED YOLO MODEL: {connected_model_path}")
                return True
            except Exception as e:
                print(f"⚠️ Could not load model from {path}: {e}")
    print("❌ No model loaded.")
    return False

# Attempt load on launch
load_model()

class YOLORequestHandler(BaseHTTPRequestHandler):
    def _send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")

    def do_OPTIONS(self):
        self.send_response(200)
        self._send_cors_headers()
        self.end_headers()

    def do_GET(self):
        if self.path == "/api/status" or self.path == "/":
            self.send_response(200)
            self._send_cors_headers()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            
            res = {
                "connected": yolo_model is not None,
                "status": "online" if yolo_model is not None else "model_missing",
                "model_path": connected_model_path,
                "expected_paths": MODEL_SEARCH_PATHS,
                "message": f"YOLO Model {'Connected' if yolo_model else 'Not Loaded'}"
            }
            self.wfile.write(json.dumps(res).encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        if self.path == "/api/detect":
            start_time = time.time()
            if yolo_model is None:
                load_model()

            if yolo_model is None:
                self.send_response(503)
                self._send_cors_headers()
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                err_res = {
                    "connected": False,
                    "message": "REAL AI MODEL NOT CONNECTED. Place best.pt in models/ folder."
                }
                self.wfile.write(json.dumps(err_res).encode('utf-8'))
                return

            try:
                content_length = int(self.headers.get('Content-Length', 0))
                body = self.rfile.read(content_length)

                # Extract raw image payload from multipart boundary or direct body
                image_bytes = None
                content_type = self.headers.get('Content-Type', '')

                if 'boundary=' in content_type:
                    boundary = content_type.split('boundary=')[1].encode()
                    parts = body.split(b'--' + boundary)
                    for part in parts:
                        if b'filename=' in part or b'name="file"' in part or b'name="image"' in part:
                            header_body_split = part.split(b'\r\n\r\n', 1)
                            if len(header_body_split) > 1:
                                raw_data = header_body_split[1]
                                # Strip trailing \r\n--
                                if raw_data.endswith(b'\r\n'):
                                    raw_data = raw_data[:-2]
                                image_bytes = raw_data
                                break
                else:
                    image_bytes = body

                if not image_bytes:
                    self.send_response(400)
                    self._send_cors_headers()
                    self.send_header("Content-Type", "application/json")
                    self.end_headers()
                    self.wfile.write(json.dumps({"error": "No image payload found"}).encode('utf-8'))
                    return

                image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
                width, height = image.size

                # Predict
                results = yolo_model.predict(source=image, verbose=False)
                detections = []

                if results and len(results) > 0:
                    res = results[0]
                    boxes = res.boxes
                    for box in boxes:
                        cls_id = int(box.cls[0].item())
                        conf = float(box.conf[0].item())
                        label = res.names.get(cls_id, "unknown")
                        xyxy = box.xyxy[0].tolist()  # [x1, y1, x2, y2]
                        
                        detections.append({
                            "label": label,
                            "confidence": round(conf * 100, 2),
                            "bbox": [round(v, 2) for v in xyxy]
                        })

                elapsed_ms = round((time.time() - start_time) * 1000, 2)

                self.send_response(200)
                self._send_cors_headers()
                self.send_header("Content-Type", "application/json")
                self.end_headers()

                out_res = {
                    "connected": True,
                    "model_path": connected_model_path,
                    "image_name": "uploaded_image.jpg",
                    "width": width,
                    "height": height,
                    "detections": detections,
                    "processing_time_ms": elapsed_ms
                }
                self.wfile.write(json.dumps(out_res).encode('utf-8'))

            except Exception as e:
                self.send_response(500)
                self._send_cors_headers()
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()

def run_server(port=8000):
    server_address = ('', port)
    httpd = HTTPServer(server_address, YOLORequestHandler)
    print(f"🚀 PenchGuard AI Python YOLO Server running on http://localhost:{port}")
    httpd.serve_forever()

if __name__ == "__main__":
    run_server()
