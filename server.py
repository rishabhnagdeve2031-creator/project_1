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
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler

# Unbuffer stdout
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(line_buffering=True)

# Import Ultralytics and PyTorch
try:
    # pyrefly: ignore [missing-import]
    from ultralytics import YOLO
    # pyrefly: ignore [missing-import]
    from PIL import Image, ImageOps
    # pyrefly: ignore [missing-import]
    import torch
    import io
except ImportError as e:
    print(f"❌ Missing Python dependency: {e}")

MODEL_SEARCH_PATHS = [
    r"C:\Users\VICTUS\OneDrive\Desktop\tiger train dataset\runs\detect\tigers2_improved\weights\best.pt",
    r"C:\Users\VICTUS\OneDrive\Desktop\tiger train dataset\runs\detect\tigers2_train-2\weights\best.pt",
    "models/best.pt",
    r"C:\Users\VICTUS\OneDrive\Desktop\tiger train dataset\runs\detect\tigers2_train\weights\best.pt",
    "models/yolo26n.pt",
    r"C:\Users\VICTUS\OneDrive\Desktop\tiger train dataset\yolo26n.pt"
]

yolo_model = None
connected_model_path = None
connected_model_name = None
connected_device = "CPU"
model_class_names = {}
model_load_error = None

def load_model():
    global yolo_model, connected_model_path, connected_model_name, connected_device, model_class_names, model_load_error
    model_load_error = None
    
    # Check GPU availability
    try:
        if torch.cuda.is_available():
            connected_device = "CUDA"
        else:
            connected_device = "CPU"
    except Exception:
        connected_device = "CPU"

    for path in MODEL_SEARCH_PATHS:
        if os.path.exists(path):
            try:
                print(f"🔄 Loading YOLO model from: {path}", flush=True)
                yolo_model = YOLO(path)
                connected_model_path = os.path.abspath(path)
                connected_model_name = os.path.basename(path)
                
                # Read class names directly from model
                if hasattr(yolo_model, 'names') and yolo_model.names:
                    model_class_names = yolo_model.names
                else:
                    model_class_names = {0: 'tiger'}

                print(f"✅ SUCCESSFULLY LOADED YOLO MODEL: {connected_model_path}", flush=True)
                print(f"   Device: {connected_device}", flush=True)
                print(f"   Classes: {model_class_names}", flush=True)
                return True
            except Exception as e:
                model_load_error = str(e)
                print(f"⚠️ Could not load model from {path}: {e}", flush=True)

    print("❌ No model loaded.", flush=True)
    return False

def extract_clean_image_bytes(body):
    # 1. JPEG check (\xff\xd8 ... \xff\xd9)
    idx_jpg_start = body.find(b'\xff\xd8')
    if idx_jpg_start != -1:
        idx_jpg_end = body.rfind(b'\xff\xd9')
        if idx_jpg_end != -1 and idx_jpg_end > idx_jpg_start:
            return body[idx_jpg_start:idx_jpg_end + 2]
        return body[idx_jpg_start:]
    
    # 2. PNG check (\x89PNG ... IEND\xae\x42\x60\x82)
    idx_png_start = body.find(b'\x89PNG')
    if idx_png_start != -1:
        idx_png_end = body.rfind(b'IEND\xae\x42\x60\x82')
        if idx_png_end != -1 and idx_png_end > idx_png_start:
            return body[idx_png_start:idx_png_end + 8]
        return body[idx_png_start:]

    return body

def nms_filter(detections, iou_threshold=0.45):
    """Simple IoU NMS — returns the highest-conf box from overlapping groups."""
    if not detections:
        return []
    detections = sorted(detections, key=lambda d: d['confidence'], reverse=True)
    kept = []
    for det in detections:
        b = det['bbox']
        x1, y1, x2, y2 = b['x1'], b['y1'], b['x2'], b['y2']
        suppress = False
        for k in kept:
            kb = k['bbox']
            ix1 = max(x1, kb['x1']); iy1 = max(y1, kb['y1'])
            ix2 = min(x2, kb['x2']); iy2 = min(y2, kb['y2'])
            iw = max(0.0, ix2 - ix1); ih = max(0.0, iy2 - iy1)
            inter = iw * ih
            area_a = (x2 - x1) * (y2 - y1)
            area_b = (kb['x2'] - kb['x1']) * (kb['y2'] - kb['y1'])
            union = area_a + area_b - inter
            if union > 0 and (inter / union) > iou_threshold:
                suppress = True
                break
        if not suppress:
            kept.append(det)
    return kept

# Attempt load on launch
load_model()

class YOLORequestHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        try:
            print(f"[{self.log_date_time_string()}] {format % args}", flush=True)
        except Exception:
            pass

    def _send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")

    def do_OPTIONS(self):
        self.send_response(200)
        self._send_cors_headers()
        self.end_headers()

    def _send_json(self, status_code, data):
        try:
            response_bytes = json.dumps(data, default=str).encode('utf-8')
            self.send_response(status_code)
            self._send_cors_headers()
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(response_bytes)))
            self.end_headers()
            self.wfile.write(response_bytes)
        except Exception as e:
            print(f"❌ Error sending JSON: {e}", flush=True)

    def do_GET(self):
        if self.path.startswith("/api/status") or self.path == "/":
            is_connected = yolo_model is not None
            is_tiger_model = any("tiger" in str(v).lower() for v in model_class_names.values()) if is_connected else False
            
            res = {
                "connected": is_connected,
                "status": "online" if is_connected else "offline",
                "model_name": connected_model_name or "best.pt",
                "model_path": connected_model_path,
                "model_type": "Trained Tiger Detector" if is_tiger_model else "BASE/FALLBACK MODEL",
                "class_names": list(model_class_names.values()) if is_connected else [],
                "class_map": model_class_names if is_connected else {},
                "device": connected_device,
                "inference_available": is_connected,
                "expected_paths": MODEL_SEARCH_PATHS,
                "error": model_load_error,
                "message": f"YOLO ONLINE — {connected_model_name}" if is_connected else f"YOLO OFFLINE — {model_load_error or 'Model Load Error'}"
            }
            self._send_json(200, res)
        else:
            self.send_response(404)
            self._send_cors_headers()
            self.end_headers()

    def do_POST(self):
        try:
            print(f"📥 POST received for path: {self.path}", flush=True)
            if self.path.startswith("/api/detect"):
                start_time = time.time()
                if yolo_model is None:
                    load_model()

                if yolo_model is None:
                    err_res = {
                        "connected": False,
                        "status": "offline",
                        "error": model_load_error or "Model missing or failed to initialize",
                        "message": "YOLO OFFLINE — Model Load Error"
                    }
                    self._send_json(503, err_res)
                    return

                content_length = int(self.headers.get('Content-Length', 0))
                body = self.rfile.read(content_length)

                image_bytes = None
                content_type = self.headers.get('Content-Type', '')

                if 'application/json' in content_type:
                    try:
                        json_data = json.loads(body.decode('utf-8'))
                        img_str = json_data.get('image', '') or json_data.get('file', '')
                        if img_str.startswith('data:image'):
                            img_str = img_str.split(',', 1)[1]
                        import base64
                        image_bytes = base64.b64decode(img_str)
                    except Exception:
                        image_bytes = extract_clean_image_bytes(body)
                else:
                    image_bytes = extract_clean_image_bytes(body)

                if not image_bytes:
                    self._send_json(400, {"error": "No valid image payload found"})
                    return

                raw_img = Image.open(io.BytesIO(image_bytes))
                image = ImageOps.exif_transpose(raw_img).convert("RGB")
                width, height = image.size

                # Parse optional confidence threshold parameter
                # Default 0.10 (10%) — high enough to reject non-tiger false positives,
                # low enough to catch real tiger detections (typically 14%+ for best.pt)
                conf_val = 0.10
                if "?" in self.path and "conf=" in self.path:
                    try:
                        conf_val = float(self.path.split("conf=")[1].split("&")[0])
                    except Exception:
                        conf_val = 0.10

                print(f"🔍 PREDICT DEBUG: bytes={len(image_bytes)}, size={width}x{height}, conf={conf_val}", flush=True)

                # Predict using actual best.pt model
                results = yolo_model.predict(source=image, verbose=False, conf=conf_val)
                print(f"🔍 PREDICT RESULT: boxes count={len(results[0].boxes) if results else 0}", flush=True)
                detections = []

                if results and len(results) > 0:
                    res = results[0]
                    boxes = res.boxes
                    for box in boxes:
                        cls_id = int(box.cls[0].item())
                        conf = float(box.conf[0].item())
                        label = res.names.get(cls_id, f"class_{cls_id}")
                        xyxy = box.xyxy[0].tolist()  # [x1, y1, x2, y2]
                        
                        detections.append({
                            "class": label,
                            "label": label,
                            "class_id": cls_id,
                            "confidence": round(conf, 4),
                            "confidence_pct": round(conf * 100, 2),
                            "bbox": {
                                "x1": round(float(xyxy[0]), 2),
                                "y1": round(float(xyxy[1]), 2),
                                "x2": round(float(xyxy[2]), 2),
                                "y2": round(float(xyxy[3]), 2)
                            },
                            "xyxy": [round(float(v), 2) for v in xyxy]
                        })

                # Apply NMS to remove overlapping duplicate boxes
                detections = nms_filter(detections, iou_threshold=0.45)

                elapsed_ms = round((time.time() - start_time) * 1000, 2)

                out_res = {
                    "connected": True,
                    "model": connected_model_name or "best.pt",
                    "model_path": connected_model_path,
                    "device": connected_device,
                    "width": width,
                    "height": height,
                    "detections": detections,
                    "inference_time_ms": elapsed_ms,
                    "processing_time_ms": elapsed_ms
                }
                self._send_json(200, out_res)
            else:
                self.send_response(404)
                self._send_cors_headers()
                self.end_headers()
        except Exception as e:
            import traceback
            traceback.print_exc()
            try:
                self._send_json(500, {"error": str(e), "message": f"Server Error: {str(e)}"})
            except Exception:
                pass

def run_server(port=8000):
    server_address = ('', port)
    httpd = ThreadingHTTPServer(server_address, YOLORequestHandler)
    print(f"🚀 PenchGuard AI Python YOLO Server running on http://localhost:{port}", flush=True)
    httpd.serve_forever()

if __name__ == "__main__":
    run_server()
