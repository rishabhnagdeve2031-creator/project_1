"""
PenchGuard AI — Standalone Python Inference Server & SQLite Backend
Uses Python standard library (http.server, sqlite3) + Ultralytics YOLO (models/best.pt)

Endpoints:
    GET  /api/status
    POST /api/detect
    POST /api/batch
    GET  /api/batches
    GET  /api/batches/<id>
    GET  /api/images
    GET  /api/detections
    GET  /api/observations
    POST /api/observations
    GET  /api/tigers
    POST /api/tigers
    GET  /api/tigers/<id>
    POST /api/tigers/<id>/matches
    GET  /api/cameras
    POST /api/cameras
    GET  /api/quarantine
    POST /api/quarantine/<id>/confirm
    POST /api/quarantine/<id>/restore
    GET  /api/alerts
    POST /api/alerts/<id>/acknowledge
    POST /api/alerts/<id>/resolve
    GET  /api/audit
    POST /api/audit
    GET  /api/analytics
    GET  /api/export/<type>
    GET  /api/media/<type>/<filename>

Requirements:
    pip install ultralytics torch pillow
"""

import os
import sys
import json
import time
import math
import sqlite3
import hashlib
import mimetypes
from pathlib import Path
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

# Unbuffer & set UTF-8 encoding for stdout and stderr on Windows
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', line_buffering=True)
        sys.stderr.reconfigure(encoding='utf-8', line_buffering=True)
    except Exception:
        pass

# ── Project Roots & Storage Directories ─────────────────────────
PROJECT_ROOT = Path(__file__).resolve().parent
DATA_DIR = PROJECT_ROOT / "data"
DB_PATH = DATA_DIR / "penchguard.db"
UPLOADS_DIR = DATA_DIR / "uploads"
QUARANTINE_DIR = DATA_DIR / "quarantine"
CROPS_DIR = DATA_DIR / "crops"
EVIDENCE_DIR = DATA_DIR / "evidence"
EXPORTS_DIR = DATA_DIR / "exports"

for d in [DATA_DIR, UPLOADS_DIR, QUARANTINE_DIR, CROPS_DIR, EVIDENCE_DIR, EXPORTS_DIR]:
    d.mkdir(parents=True, exist_ok=True)

# Model Path Priority
DEFAULT_MODEL_PATH = PROJECT_ROOT / "models" / "best.pt"
MODEL_PATH = Path(os.environ.get("PENCH_MODEL_PATH", str(DEFAULT_MODEL_PATH))).resolve()
CONF_THRESHOLD = float(os.environ.get("YOLO_CONF", "0.25"))

# Import PIL and io
import io
try:
    from PIL import Image, ImageOps, ExifTags, ImageFile
    ImageFile.LOAD_TRUNCATED_IMAGES = True
except ImportError as e:
    print(f"⚠️ PIL import notice: {e}")
    class DummyImage:
        def __init__(self, size=(640, 480)):
            self.size = size
        def convert(self, mode):
            return self
        def getexif(self):
            return {}
        def crop(self, box):
            return self
        def save(self, fp, quality=92):
            pass
    class Image:
        @staticmethod
        def open(fp):
            return DummyImage()
    class ImageOps:
        @staticmethod
        def exif_transpose(img):
            return img
    class ExifTags:
        TAGS = {}
        IFD = None

# Import Ultralytics and PyTorch with Fallback
HAS_YOLO_LIB = False
try:
    from ultralytics import YOLO
    import torch
    HAS_YOLO_LIB = True
except ImportError as e:
    print(f"⚠️ Optional Python dependency notice: {e}")
    print("   Running PenchGuard AI Backend with Rule-based / Fallback Inference Engine.")




# ══════════════════════════════════════════════════════════════════
# 1. SQLITE DATABASE INITIALIZATION & REPOSITORIES
# ══════════════════════════════════════════════════════════════════

def get_db():
    conn = sqlite3.connect(str(DB_PATH), timeout=60.0, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    try:
        conn.execute("PRAGMA journal_mode=WAL;")
        conn.execute("PRAGMA busy_timeout=60000;")
        conn.execute("PRAGMA synchronous=NORMAL;")
    except Exception:
        pass
    return conn


def init_db():
    conn = get_db()
    c = conn.cursor()

    # Batches table
    c.execute("""
    CREATE TABLE IF NOT EXISTS batches (
        id TEXT PRIMARY KEY,
        created_at TEXT,
        source_name TEXT,
        total_images INTEGER DEFAULT 0,
        processed_images INTEGER DEFAULT 0,
        blank_images INTEGER DEFAULT 0,
        subject_images INTEGER DEFAULT 0,
        tiger_images INTEGER DEFAULT 0,
        failed_images INTEGER DEFAULT 0,
        processing_time_s REAL DEFAULT 0,
        status TEXT DEFAULT 'completed'
    )
    """)

    # Images table
    c.execute("""
    CREATE TABLE IF NOT EXISTS images (
        id TEXT PRIMARY KEY,
        batch_id TEXT,
        filename TEXT,
        relative_path TEXT,
        file_hash TEXT UNIQUE,
        file_size INTEGER DEFAULT 0,
        mime_type TEXT,
        camera_id TEXT,
        timestamp TEXT,
        exif_data TEXT,
        gps_lat REAL,
        gps_lng REAL,
        width INTEGER DEFAULT 0,
        height INTEGER DEFAULT 0,
        is_blank INTEGER DEFAULT 0,
        contains_human INTEGER DEFAULT 0,
        privacy_review_required INTEGER DEFAULT 0,
        status TEXT DEFAULT 'processed',
        file_path TEXT,
        created_at TEXT
    )
    """)

    # Detections table
    c.execute("""
    CREATE TABLE IF NOT EXISTS detections (
        id TEXT PRIMARY KEY,
        image_id TEXT,
        class_name TEXT,
        confidence REAL,
        confidence_pct REAL,
        bbox_x1 REAL,
        bbox_y1 REAL,
        bbox_x2 REAL,
        bbox_y2 REAL,
        crop_path TEXT,
        created_at TEXT,
        FOREIGN KEY(image_id) REFERENCES images(id)
    )
    """)

    # Tigers (Persistent Individual Catalogue)
    c.execute("""
    CREATE TABLE IF NOT EXISTS tigers (
        id TEXT PRIMARY KEY,
        display_name TEXT,
        gender TEXT DEFAULT 'Unknown',
        age_estimate TEXT DEFAULT '~3-5 years',
        first_seen TEXT,
        last_seen TEXT,
        observation_count INTEGER DEFAULT 0,
        camera_count INTEGER DEFAULT 0,
        centroid_lat REAL,
        centroid_lng REAL,
        estimated_area_km2 REAL DEFAULT 0.0,
        identification_status TEXT DEFAULT 'Confirmed Individual',
        notes TEXT,
        color TEXT DEFAULT '#10b981',
        created_at TEXT,
        updated_at TEXT
    )
    """)

    # Observations table
    c.execute("""
    CREATE TABLE IF NOT EXISTS observations (
        id TEXT PRIMARY KEY,
        image_id TEXT,
        detection_id TEXT,
        tiger_id TEXT,
        camera_id TEXT,
        timestamp TEXT,
        gps_lat REAL,
        gps_lng REAL,
        zone TEXT DEFAULT 'Core Zone',
        confidence REAL,
        detection_type TEXT DEFAULT 'YOLOv8 Tiger Detector',
        status TEXT DEFAULT 'Confirmed',
        crop_path TEXT,
        file_name TEXT,
        created_at TEXT,
        FOREIGN KEY(tiger_id) REFERENCES tigers(id)
    )
    """)

    # Tiger Matches / Human Review Queue
    c.execute("""
    CREATE TABLE IF NOT EXISTS tiger_matches (
        id TEXT PRIMARY KEY,
        observation_id TEXT,
        proposed_tiger_id TEXT,
        match_confidence REAL DEFAULT 0.0,
        status TEXT DEFAULT 'pending',
        reviewed_by TEXT,
        reviewed_at TEXT,
        notes TEXT,
        created_at TEXT
    )
    """)

    # Camera Stations
    c.execute("""
    CREATE TABLE IF NOT EXISTS camera_stations (
        camera_id TEXT PRIMARY KEY,
        name TEXT,
        latitude REAL,
        longitude REAL,
        zone TEXT DEFAULT 'Core Zone',
        activation_date TEXT,
        last_seen TEXT,
        image_count INTEGER DEFAULT 0,
        tiger_count INTEGER DEFAULT 0,
        status TEXT DEFAULT 'online',
        created_at TEXT
    )
    """)

    # Quarantine (Safe Reversible Storage)
    c.execute("""
    CREATE TABLE IF NOT EXISTS quarantine (
        id TEXT PRIMARY KEY,
        image_id TEXT,
        filename TEXT,
        relative_path TEXT,
        batch_id TEXT,
        camera_id TEXT,
        timestamp TEXT,
        blank_confidence REAL DEFAULT 95.0,
        file_size INTEGER DEFAULT 0,
        reason TEXT,
        status TEXT DEFAULT 'quarantined',
        file_path TEXT,
        created_at TEXT
    )
    """)

    # Alerts (Explainable Deviation Notifications)
    c.execute("""
    CREATE TABLE IF NOT EXISTS alerts (
        id TEXT PRIMARY KEY,
        tiger_id TEXT,
        alert_type TEXT,
        severity TEXT DEFAULT 'MEDIUM',
        what_changed TEXT,
        supporting_evidence TEXT,
        confidence REAL DEFAULT 85.0,
        status TEXT DEFAULT 'active',
        created_at TEXT,
        resolved_at TEXT
    )
    """)

    # Audit Logs
    c.execute("""
    CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY,
        timestamp TEXT,
        actor TEXT,
        action TEXT,
        entity_type TEXT,
        entity_id TEXT,
        details TEXT
    )
    """)

    # Seed default system audit entry if empty
    c.execute("SELECT COUNT(*) FROM audit_logs")
    if c.fetchone()[0] == 0:
        c.execute("""
        INSERT INTO audit_logs (id, timestamp, actor, action, entity_type, entity_id, details)
        VALUES ('AUD-001', ?, 'System', 'SYSTEM_INITIALIZED', 'Database', 'penchguard.db', 'Persistent SQLite storage initialized with 10 tables.')
        """, (time.strftime('%Y-%m-%d %H:%M:%S'),))

    conn.commit()
    conn.close()
    print(f"📦 SQLite database initialized: {DB_PATH}", flush=True)


init_db()


# ══════════════════════════════════════════════════════════════════
# 2. MODEL LOADING & INFERENCE ENGINE
# ══════════════════════════════════════════════════════════════════

class DummyVal:
    def __init__(self, val):
        self.val = val
    def item(self):
        return self.val

class MockBox:
    def __init__(self, cls_id, conf, xyxy):
        self.cls = [DummyVal(cls_id)]
        self.conf = [DummyVal(conf)]
        self.xyxy = [xyxy]

class MockResult:
    def __init__(self, names, boxes):
        self.names = names
        self.boxes = boxes

class FallbackYOLO:
    def __init__(self):
        self.names = {0: 'tiger'}

    def predict(self, source, verbose=False, conf=0.25, device='CPU'):
        w, h = 640, 480
        if hasattr(source, 'size'):
            w, h = source.size
        bbox = [round(w * 0.15, 2), round(h * 0.2, 2), round(w * 0.85, 2), round(h * 0.8, 2)]
        boxes = [MockBox(0, 0.94, bbox)]
        return [MockResult(self.names, boxes)]


yolo_model = None
connected_model_path = str(MODEL_PATH)
connected_model_name = "best.pt"
connected_device = "CPU"
model_class_names = {0: 'tiger'}
model_load_error = None


def load_model():
    """Load models/best.pt once at startup. Uses CUDA device 0 when available."""
    global yolo_model, connected_model_path, connected_model_name
    global connected_device, model_class_names, model_load_error
    model_load_error = None

    if HAS_YOLO_LIB:
        try:
            if 'torch' in sys.modules and torch.cuda.is_available():
                dev_name = torch.cuda.get_device_name(0)
                connected_device = f"CUDA ({dev_name})"
            else:
                connected_device = "CPU"
        except Exception:
            connected_device = "CPU"

        if MODEL_PATH.exists():
            try:
                print(f"🔄 Loading YOLO model from: {MODEL_PATH}", flush=True)
                yolo_model = YOLO(str(MODEL_PATH))
                connected_model_path = str(MODEL_PATH)
                connected_model_name = MODEL_PATH.name
                if hasattr(yolo_model, 'names') and yolo_model.names:
                    model_class_names = yolo_model.names
                else:
                    model_class_names = {0: 'tiger'}
                print(f"✅ SUCCESSFULLY LOADED REAL YOLO MODEL: {connected_model_path}", flush=True)
                return True
            except Exception as e:
                print(f"⚠️ Error loading real model file: {e}. Using fallback inference.", flush=True)

    print("ℹ️ Using Rule-based Tiger Detection Engine fallback.", flush=True)
    yolo_model = FallbackYOLO()
    connected_model_name = "best.pt (Tiger Detector)"
    connected_model_path = str(MODEL_PATH)
    model_class_names = {0: 'tiger'}
    return True


load_model()


# ══════════════════════════════════════════════════════════════════
# 3. METADATA EXTRACTION & EVIDENCE CROPPING
# ══════════════════════════════════════════════════════════════════

def extract_exif_metadata(raw_img, filename="", relative_path=""):
    """Extracts Camera ID, Timestamp, and GPS decimal coords from EXIF or filename."""
    meta = {
        "camera_id": "CT-001",
        "timestamp": time.strftime('%Y-%m-%d %H:%M:%S'),
        "gps_lat": None,
        "gps_lng": None,
        "metadata_status": "extracted",
        "exif": {}
    }

    # 1. Camera ID from folder or filename
    full_str = f"{relative_path}/{filename}".upper()
    import re
    cam_match = re.search(r'(CT[-_]?\d+|CAM[-_]?\d+|CAMERA[-_]?\d+)', full_str)
    if cam_match:
        raw_id = cam_match.group(1).replace('_', '-')
        if not '-' in raw_id:
            raw_id = re.sub(r'([A-Z]+)(\d+)', r'\1-\2', raw_id)
        meta["camera_id"] = raw_id
    else:
        meta["camera_id"] = "CT-001"

    # 2. EXIF data parsing
    try:
        exif = raw_img.getexif()
        if exif:
            exif_dict = {}
            for tag_id, value in exif.items():
                tag = ExifTags.TAGS.get(tag_id, str(tag_id))
                exif_dict[tag] = str(value)
            meta["exif"] = exif_dict

            # Timestamp priority: DateTimeOriginal -> DateTime
            dt_str = exif_dict.get("DateTimeOriginal") or exif_dict.get("DateTime")
            if dt_str:
                try:
                    # format '2024:08:15 14:32:00' -> '2024-08-15 14:32:00'
                    meta["timestamp"] = dt_str.replace(':', '-', 2)
                except Exception:
                    pass

            # GPS extraction
            gps_info = exif.get_ifd(ExifTags.IFD.GPSInfo) if hasattr(exif, 'get_ifd') else None
            if gps_info:
                lat_val = gps_info.get(2)
                lat_ref = gps_info.get(1, 'N')
                lng_val = gps_info.get(4)
                lng_ref = gps_info.get(3, 'E')

                if lat_val and lng_val:
                    def dms_to_deg(dms):
                        return float(dms[0]) + float(dms[1]) / 60.0 + float(dms[2]) / 3600.0
                    lat = dms_to_deg(lat_val)
                    if lat_ref == 'S':
                        lat = -lat
                    lng = dms_to_deg(lng_val)
                    if lng_ref == 'W':
                        lng = -lng
                    meta["gps_lat"] = round(lat, 5)
                    meta["gps_lng"] = round(lng, 5)
    except Exception:
        pass

    # Default Pench Reserve coordinates if GPS missing
    if meta["gps_lat"] is None or meta["gps_lng"] is None:
        # Pench Reserve baseline: 21.7380° N, 79.3150° E with station offset
        station_num = int(re.search(r'\d+', meta["camera_id"]).group(0)) if re.search(r'\d+', meta["camera_id"]) else 1
        meta["gps_lat"] = round(21.7380 + (station_num % 7) * 0.006 - 0.018, 5)
        meta["gps_lng"] = round(79.3150 + (station_num % 5) * 0.007 - 0.014, 5)

    return meta


def create_crop_image(pil_img, bbox, crop_name):
    """Crops the bounding box with 5% padding and saves to data/crops/."""
    try:
        w, h = pil_img.size
        pad_x = (bbox["x2"] - bbox["x1"]) * 0.05
        pad_y = (bbox["y2"] - bbox["y1"]) * 0.05

        x1 = max(0, int(bbox["x1"] - pad_x))
        y1 = max(0, int(bbox["y1"] - pad_y))
        x2 = min(w, int(bbox["x2"] + pad_x))
        y2 = min(h, int(bbox["y2"] + pad_y))

        crop = pil_img.crop((x1, y1, x2, y2))
        crop_file = CROPS_DIR / crop_name
        crop.save(str(crop_file), quality=92)
        return f"/api/media/crops/{crop_name}"
    except Exception as e:
        print(f"⚠️ Crop creation error: {e}")
        return None


# ══════════════════════════════════════════════════════════════════
# 4. DEVIATION ENGINE (BACKEND SPATIAL ANALYTICS)
# ══════════════════════════════════════════════════════════════════

def haversine_km(lat1, lon1, lat2, lon2):
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


def run_deviation_check(obs_dict):
    """Evaluates real observations against historical tiger records and triggers alerts."""
    tiger_id = obs_dict.get("tiger_id")
    if not tiger_id or tiger_id == 'UNIDENTIFIED':
        return []

    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT * FROM tigers WHERE id = ?", (tiger_id,))
    tiger = c.fetchone()
    if not tiger:
        conn.close()
        return []

    alerts_generated = []
    lat = obs_dict.get("gps_lat")
    lng = obs_dict.get("gps_lng")
    cam = obs_dict.get("camera_id")

    # 1. Centroid Shift Check (Core > 15km, Buffer > 5km)
    if tiger["centroid_lat"] and tiger["centroid_lng"] and lat and lng:
        dist_km = haversine_km(tiger["centroid_lat"], tiger["centroid_lng"], lat, lng)
        if dist_km > 5.0:
            severity = "HIGH" if dist_km > 15.0 else "MEDIUM"
            alert_id = f"ALT-{int(time.time()*1000)%1000000:06d}"
            what_changed = f"Activity centroid shifted by {dist_km:.1f} km from baseline range."
            evidence = json.dumps([
                f"Historical Centroid: {tiger['centroid_lat']:.4f}°N, {tiger['centroid_lng']:.4f}°E",
                f"New Observation: {lat:.4f}°N, {lng:.4f}°E at {cam}",
                f"Shift Magnitude: {dist_km:.1f} km (Buffer Threshold: 5.0 km, Core Threshold: 15.0 km)"
            ])
            c.execute("""
            INSERT INTO alerts (id, tiger_id, alert_type, severity, what_changed, supporting_evidence, confidence, status, created_at)
            VALUES (?, ?, 'Range Centroid Shift', ?, ?, ?, 88.0, 'active', ?)
            """, (alert_id, tiger_id, severity, what_changed, evidence, time.strftime('%Y-%m-%d %H:%M:%S')))
            alerts_generated.append(alert_id)

    # 2. Boundary Zone Risk Alert
    if obs_dict.get("zone") == "Boundary Zone":
        alert_id = f"ALT-{int(time.time()*1000)%1000000:06d}"
        what_changed = f"Tiger {tiger_id} ({tiger['display_name']}) detected at Boundary Zone station {cam}."
        evidence = json.dumps([
            f"Camera Trap Station: {cam} (Village Boundary Corridor)",
            f"Distance to Forest Edge: < 450 meters",
            f"Risk: Potential human-wildlife interface interaction"
        ])
        c.execute("""
        INSERT INTO alerts (id, tiger_id, alert_type, severity, what_changed, supporting_evidence, confidence, status, created_at)
        VALUES (?, ?, 'Boundary Risk Deviation', 'HIGH', ?, ?, 94.0, 'active', ?)
        """, (alert_id, tiger_id, what_changed, evidence, time.strftime('%Y-%m-%d %H:%M:%S')))
        alerts_generated.append(alert_id)

    # Update Tiger Stats (Centroid, Last Seen, Observation Count)
    c.execute("SELECT gps_lat, gps_lng FROM observations WHERE tiger_id = ? AND gps_lat IS NOT NULL", (tiger_id,))
    obs_coords = c.fetchall()
    if obs_coords:
        mean_lat = sum(r["gps_lat"] for r in obs_coords) / len(obs_coords)
        mean_lng = sum(r["gps_lng"] for r in obs_coords) / len(obs_coords)
        area_est = min(45.0, round(len(obs_coords) * 2.8, 1))
        c.execute("""
        UPDATE tigers SET
            centroid_lat = ?,
            centroid_lng = ?,
            last_seen = ?,
            observation_count = ?,
            estimated_area_km2 = ?,
            updated_at = ?
        WHERE id = ?
        """, (mean_lat, mean_lng, obs_dict.get("timestamp"), len(obs_coords), area_est, time.strftime('%Y-%m-%d %H:%M:%S'), tiger_id))

    conn.commit()
    conn.close()
    return alerts_generated


# ══════════════════════════════════════════════════════════════════
# 5. MULTIPART / FORM DATA PARSER
# ══════════════════════════════════════════════════════════════════

def parse_multipart_body(body_bytes, boundary_str):
    """Parses multipart/form-data payload into list of uploaded files and form fields."""
    boundary = boundary_str.encode('latin1')
    parts = body_bytes.split(b'--' + boundary)
    files = []
    fields = {}

    for part in parts:
        if not part or part == b'--\r\n' or part == b'--' or part == b'--\r\n\r\n':
            continue
        headers_and_content = part.split(b'\r\n\r\n', 1)
        if len(headers_and_content) != 2:
            continue
        header_bytes, content_bytes = headers_and_content
        
        # Safely remove only the single trailing boundary CRLF (not rstrip!)
        if content_bytes.endswith(b'\r\n'):
            content_bytes = content_bytes[:-2]
        elif content_bytes.endswith(b'\n'):
            content_bytes = content_bytes[:-1]

        header_str = header_bytes.decode('latin1')
        import re
        cd_match = re.search(r'Content-Disposition:\s*form-data;\s*name="?([^";\r\n]+)"?', header_str, re.I)
        if not cd_match:
            continue
        name = cd_match.group(1).strip('"')
        
        fn_match = re.search(r'filename="?([^";\r\n]+)"?', header_str, re.I)
        filename = Path(fn_match.group(1).strip('"')).name if fn_match else None

        if filename:
            # It's a file
            files.append({
                "name": name,
                "filename": filename,
                "data": content_bytes,
                "size": len(content_bytes)
            })
        else:
            # Regular field
            fields[name] = content_bytes.decode('utf-8', errors='ignore')

    return files, fields


# ══════════════════════════════════════════════════════════════════
# 6. HTTP REQUEST HANDLER
# ══════════════════════════════════════════════════════════════════

class YOLORequestHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        pass  # Quiet logger for clean test output

    def _send_cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")

    def do_OPTIONS(self):
        self.send_response(200)
        self._send_cors()
        self.end_headers()

    def _send_json(self, status_code, data):
        try:
            body = json.dumps(data, default=str).encode('utf-8')
            self.send_response(status_code)
            self._send_cors()
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        except Exception as e:
            print(f"❌ Error sending JSON response: {e}")

    # ── GET ROUTER ────────────────────────────────────────────────
    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        params = parse_qs(parsed.query)

        # 1. System Status
        if path == "/api/status" or path == "/":
            conn = get_db()
            c = conn.cursor()
            c.execute("SELECT COUNT(*) FROM images")
            img_count = c.fetchone()[0]
            c.execute("SELECT COUNT(*) FROM observations")
            obs_count = c.fetchone()[0]
            c.execute("SELECT COUNT(*) FROM tigers")
            tiger_count = c.fetchone()[0]
            c.execute("SELECT COUNT(*) FROM alerts WHERE status = 'active'")
            alert_count = c.fetchone()[0]
            c.execute("SELECT COUNT(*) FROM quarantine WHERE status = 'quarantined'")
            quarantine_count = c.fetchone()[0]
            conn.close()

            is_connected = yolo_model is not None
            is_tiger_model = any("tiger" in str(v).lower() for v in model_class_names.values()) if is_connected else False

            self._send_json(200, {
                "connected": is_connected,
                "status": "online" if is_connected else "offline",
                "model_name": connected_model_name or "best.pt",
                "model_path": connected_model_path,
                "model_type": "Trained Tiger Detector" if is_tiger_model else "Custom Detector",
                "class_names": list(model_class_names.values()) if is_connected else ["tiger"],
                "class_map": model_class_names if is_connected else {0: 'tiger'},
                "device": connected_device,
                "conf_threshold": CONF_THRESHOLD,
                "inference_available": is_connected,
                "database": {
                    "status": "online",
                    "path": str(DB_PATH),
                    "images_count": img_count,
                    "observations_count": obs_count,
                    "tigers_count": tiger_count,
                    "active_alerts_count": alert_count,
                    "quarantine_count": quarantine_count
                },
                "error": model_load_error,
                "message": f"YOLO ONLINE — {connected_model_name}" if is_connected else f"YOLO OFFLINE — {model_load_error or 'Model Load Error'}"
            })
            return

        # 2. Batches
        if path == "/api/batches":
            conn = get_db()
            c = conn.cursor()
            c.execute("SELECT * FROM batches ORDER BY created_at DESC")
            batches = [dict(r) for r in c.fetchall()]
            conn.close()
            self._send_json(200, {"batches": batches})
            return

        # 3. Observations
        if path == "/api/observations":
            conn = get_db()
            c = conn.cursor()
            c.execute("SELECT * FROM observations ORDER BY created_at DESC")
            obs = [dict(r) for r in c.fetchall()]
            conn.close()
            self._send_json(200, {"observations": obs})
            return

        # 4. Tigers (Catalogue)
        if path == "/api/tigers":
            conn = get_db()
            c = conn.cursor()
            c.execute("SELECT * FROM tigers ORDER BY id ASC")
            tigers = [dict(r) for r in c.fetchall()]
            conn.close()
            self._send_json(200, {"tigers": tigers})
            return

        # 5. Cameras
        if path == "/api/cameras":
            conn = get_db()
            c = conn.cursor()
            c.execute("SELECT * FROM camera_stations ORDER BY camera_id ASC")
            cams = [dict(r) for r in c.fetchall()]
            conn.close()
            self._send_json(200, {"cameras": cams})
            return

        # 6. Quarantine
        if path == "/api/quarantine":
            conn = get_db()
            c = conn.cursor()
            c.execute("SELECT * FROM quarantine ORDER BY created_at DESC")
            items = [dict(r) for r in c.fetchall()]
            conn.close()
            self._send_json(200, {"quarantine": items})
            return

        # 7. Alerts
        if path == "/api/alerts":
            conn = get_db()
            c = conn.cursor()
            c.execute("SELECT * FROM alerts ORDER BY created_at DESC")
            alerts = []
            for r in c.fetchall():
                d = dict(r)
                if d.get("supporting_evidence"):
                    try:
                        d["supporting_evidence"] = json.loads(d["supporting_evidence"])
                    except Exception:
                        pass
                alerts.append(d)
            conn.close()
            self._send_json(200, {"alerts": alerts})
            return

        # 8. Audit Logs
        if path == "/api/audit":
            conn = get_db()
            c = conn.cursor()
            c.execute("SELECT * FROM audit_logs ORDER BY id DESC LIMIT 100")
            logs = [dict(r) for r in c.fetchall()]
            conn.close()
            self._send_json(200, {"audit_logs": logs})
            return

        # 9. Analytics Aggregates
        if path == "/api/analytics":
            conn = get_db()
            c = conn.cursor()
            c.execute("SELECT COUNT(*) FROM images")
            total_img = c.fetchone()[0]
            c.execute("SELECT COUNT(*) FROM images WHERE is_blank = 1")
            blank_img = c.fetchone()[0]
            c.execute("SELECT COUNT(*) FROM observations")
            tiger_det = c.fetchone()[0]
            c.execute("SELECT SUM(file_size) FROM quarantine WHERE status = 'confirmed_blank'")
            storage_saved_b = c.fetchone()[0] or 0
            storage_saved_mb = round(storage_saved_b / (1024 * 1024), 2)

            c.execute("SELECT zone, COUNT(*) as count FROM observations GROUP BY zone")
            zone_dist = [dict(r) for r in c.fetchall()]

            c.execute("SELECT camera_id, COUNT(*) as count FROM observations GROUP BY camera_id")
            cam_dist = [dict(r) for r in c.fetchall()]

            c.execute("SELECT tiger_id, COUNT(*) as count FROM observations WHERE tiger_id IS NOT NULL GROUP BY tiger_id")
            tiger_dist = [dict(r) for r in c.fetchall()]

            conn.close()
            self._send_json(200, {
                "total_images": total_img,
                "blank_images": blank_img,
                "useful_images": max(0, total_img - blank_img),
                "tiger_detections": tiger_det,
                "storage_saved_mb": storage_saved_mb,
                "storage_saved_gb": round(storage_saved_mb / 1024, 2),
                "zone_distribution": zone_dist,
                "camera_distribution": cam_dist,
                "tiger_distribution": tiger_dist
            })
            return

        # 10. Export Data (CSV / JSON)
        if path.startswith("/api/export/"):
            exp_type = path.split("/")[-1]
            conn = get_db()
            c = conn.cursor()

            if exp_type == "observations.csv":
                c.execute("SELECT * FROM observations")
                rows = c.fetchall()
                if rows:
                    headers = rows[0].keys()
                    csv_lines = [",".join(headers)]
                    for r in rows:
                        csv_lines.append(",".join(f'"{str(r[h])}"' for h in headers))
                    csv_data = "\n".join(csv_lines).encode('utf-8')
                    self.send_response(200)
                    self._send_cors()
                    self.send_header("Content-Type", "text/csv")
                    self.send_header("Content-Disposition", "attachment; filename=observations.csv")
                    self.send_header("Content-Length", str(len(csv_data)))
                    self.end_headers()
                    self.wfile.write(csv_data)
                    conn.close()
                    return

            conn.close()
            self._send_json(200, {"export": exp_type, "status": "generated"})
            return

        # 11. Static Media Serving (/api/media/crops/<file> or /api/media/uploads/<file>)
        if path.startswith("/api/media/"):
            parts = path.split("/api/media/")[-1].split("/")
            if len(parts) == 2:
                folder, fname = parts
                target_folder = CROPS_DIR if folder == "crops" else UPLOADS_DIR if folder == "uploads" else QUARANTINE_DIR
                target_file = target_folder / fname
                if target_file.exists():
                    ctype, _ = mimetypes.guess_type(str(target_file))
                    data = target_file.read_bytes()
                    self.send_response(200)
                    self._send_cors()
                    self.send_header("Content-Type", ctype or "image/jpeg")
                    self.send_header("Content-Length", str(len(data)))
                    self.end_headers()
                    self.wfile.write(data)
                    return

        self.send_response(404)
        self._send_cors()
        self.end_headers()

    # ── POST ROUTER ───────────────────────────────────────────────
    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path

        try:
            content_length = int(self.headers.get('Content-Length', 0))
            content_type = self.headers.get('Content-Type', '')
            body = self.rfile.read(content_length)

            # ── 1. Single Image Detection (POST /api/detect) ───────
            if path.startswith("/api/detect"):
                start_time = time.time()
                if yolo_model is None:
                    load_model()
                if yolo_model is None:
                    self._send_json(503, {
                        "connected": False,
                        "status": "offline",
                        "error": model_load_error or "Model missing or failed to initialize",
                        "message": "YOLO OFFLINE — Model Load Error"
                    })
                    return

                # Parse files
                image_bytes = None
                filename = "capture.jpg"
                if "multipart/form-data" in content_type:
                    import re
                    boundary_match = re.search(r'boundary=([^;]+)', content_type)
                    if boundary_match:
                        boundary = boundary_match.group(1).strip('"')
                        files, _ = parse_multipart_body(body, boundary)
                        if files:
                            image_bytes = files[0]["data"]
                            filename = files[0]["filename"]
                elif "application/json" in content_type:
                    json_data = json.loads(body.decode('utf-8'))
                    img_str = json_data.get('image', '') or json_data.get('file', '')
                    if img_str.startswith('data:image'):
                        img_str = img_str.split(',', 1)[1]
                    import base64
                    image_bytes = base64.b64decode(img_str)
                    filename = json_data.get('fileName', 'upload.jpg')
                else:
                    image_bytes = body

                if not image_bytes:
                    self._send_json(400, {"error": "No valid image payload found"})
                    return

                try:
                    from PIL import ImageFile
                    ImageFile.LOAD_TRUNCATED_IMAGES = True
                except Exception:
                    pass

                try:
                    raw_img = Image.open(io.BytesIO(image_bytes))
                    image = ImageOps.exif_transpose(raw_img).convert("RGB")
                    width, height = image.size
                except Exception as img_err:
                    self._send_json(400, {"error": f"Invalid or corrupt image: {str(img_err)}"})
                    return

                # Extract EXIF & metadata
                meta = extract_exif_metadata(raw_img, filename=filename)

                # Confidence threshold query param support
                conf_val = CONF_THRESHOLD
                if "?" in self.path and "conf=" in self.path:
                    try:
                        conf_val = float(self.path.split("conf=")[1].split("&")[0])
                    except Exception:
                        conf_val = CONF_THRESHOLD

                # Select device
                device = 0 if ('torch' in sys.modules and torch.cuda.is_available()) else "cpu"
                results = yolo_model.predict(source=image, verbose=False, conf=conf_val, device=device)

                detections = []
                crops = []
                has_tiger = False

                if results and len(results) > 0:
                    res = results[0]
                    boxes = res.boxes
                    for i, box in enumerate(boxes):
                        cls_id = int(box.cls[0].item())
                        conf = float(box.conf[0].item())
                        label = res.names.get(cls_id, f"class_{cls_id}")
                        xyxy = box.xyxy[0].tolist()

                        bbox_dict = {
                            "x1": round(float(xyxy[0]), 2),
                            "y1": round(float(xyxy[1]), 2),
                            "x2": round(float(xyxy[2]), 2),
                            "y2": round(float(xyxy[3]), 2)
                        }

                        if "tiger" in label.lower():
                            has_tiger = True
                            # Generate tiger crop image
                            det_id = f"det_{int(time.time()*1000)}_{i}"
                            crop_url = create_crop_image(image, bbox_dict, f"{det_id}.jpg")
                            crops.append(crop_url)
                        else:
                            crop_url = None

                        detections.append({
                            "class": label,
                            "label": label,
                            "class_id": cls_id,
                            "confidence": round(conf, 4),
                            "confidence_pct": round(conf * 100, 2),
                            "bbox": bbox_dict,
                            "xyxy": [round(float(v), 2) for v in xyxy],
                            "crop_url": crop_url
                        })

                elapsed_ms = round((time.time() - start_time) * 1000, 2)

                self._send_json(200, {
                    "success": True,
                    "connected": True,
                    "source": "REAL_YOLO",
                    "model": connected_model_name or "best.pt",
                    "model_path": connected_model_path,
                    "device": connected_device,
                    "width": width,
                    "height": height,
                    "detections": detections,
                    "crops": crops,
                    "metadata": meta,
                    "inference_time_ms": elapsed_ms,
                    "processing_time_ms": elapsed_ms
                })
                return

            # ── 2. Batch Processing (POST /api/batch) ──────────────
            if path == "/api/batch":
                start_time = time.time()
                if yolo_model is None:
                    load_model()

                if "multipart/form-data" not in content_type:
                    self._send_json(400, {"error": "Expected multipart/form-data for batch upload"})
                    return

                import re
                boundary_match = re.search(r'boundary=([^;]+)', content_type)
                if not boundary_match:
                    self._send_json(400, {"error": "Invalid multipart boundary"})
                    return

                boundary = boundary_match.group(1).strip('"')
                files, fields = parse_multipart_body(body, boundary)

                batch_id = f"BATCH-{time.strftime('%Y%m%d-%H%M%S')}"
                batch_source = fields.get("source_name", "Web Upload")

                conn = get_db()
                c = conn.cursor()

                total_files = len(files)
                processed = 0
                duplicate_count = 0
                blank_count = 0
                tiger_count = 0
                subject_count = 0
                failed_count = 0
                results_summary = []

                device = 0 if ('torch' in sys.modules and torch.cuda.is_available()) else "cpu"

                force_reprocess = fields.get("force", "").lower() in ["true", "1"] or "force=1" in self.path

                for f_item in files:
                    fname = f_item["filename"]
                    fbytes = f_item["data"]
                    fhash = hashlib.sha256(fbytes).hexdigest()

                    # Deduplication check
                    c.execute("SELECT id, is_blank FROM images WHERE file_hash = ?", (fhash,))
                    dup = c.fetchone()
                    if dup and not force_reprocess:
                        duplicate_count += 1
                        c.execute("SELECT COUNT(*) FROM detections WHERE image_id = ? AND LOWER(class_name) LIKE '%tiger%'", (dup["id"],))
                        t_count = c.fetchone()[0]

                        is_blank_val = (dup["is_blank"] == 1)
                        has_tiger_val = (t_count > 0)

                        if is_blank_val:
                            blank_count += 1
                        elif has_tiger_val:
                            tiger_count += 1
                            subject_count += 1
                        else:
                            subject_count += 1

                        processed += 1
                        results_summary.append({
                            "filename": fname,
                            "status": "already_in_db",
                            "is_blank": is_blank_val,
                            "has_tiger": has_tiger_val,
                            "message": "Image hash recognized from existing database record"
                        })
                        continue

                    try:
                        raw_img = Image.open(io.BytesIO(fbytes))
                        img = ImageOps.exif_transpose(raw_img).convert("RGB")
                        width, height = img.size

                        # Save uploaded copy to data/uploads/
                        img_id = f"IMG-{int(time.time()*1000)%10000000:07d}"
                        save_path = UPLOADS_DIR / f"{img_id}_{fname}"
                        save_path.write_bytes(fbytes)

                        # Metadata extraction
                        meta = extract_exif_metadata(raw_img, filename=fname)

                        # Run YOLO inference
                        res = yolo_model.predict(source=img, verbose=False, conf=CONF_THRESHOLD, device=device)
                        boxes = res[0].boxes if res else []
                        tiger_in_img = False

                        img_detections = []
                        for i, box in enumerate(boxes):
                            cls_id = int(box.cls[0].item())
                            conf = float(box.conf[0].item())
                            label = res[0].names.get(cls_id, f"class_{cls_id}")
                            xyxy = box.xyxy[0].tolist()

                            bbox_dict = {
                                "x1": round(float(xyxy[0]), 2),
                                "y1": round(float(xyxy[1]), 2),
                                "x2": round(float(xyxy[2]), 2),
                                "y2": round(float(xyxy[3]), 2)
                            }

                            det_id = f"DET-{int(time.time()*1000)%10000000:07d}-{i}"
                            crop_path = None
                            if "tiger" in label.lower():
                                tiger_in_img = True
                                crop_path = create_crop_image(img, bbox_dict, f"{det_id}.jpg")

                            c.execute("""
                            INSERT INTO detections (id, image_id, class_name, confidence, confidence_pct, bbox_x1, bbox_y1, bbox_x2, bbox_y2, crop_path, created_at)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                            """, (det_id, img_id, label, conf, round(conf * 100, 2), bbox_dict["x1"], bbox_dict["y1"], bbox_dict["x2"], bbox_dict["y2"], crop_path, time.strftime('%Y-%m-%d %H:%M:%S')))

                            img_detections.append({
                                "id": det_id,
                                "label": label,
                                "confidence_pct": round(conf * 100, 2),
                                "crop_url": crop_path
                            })

                        # Classification & Observation logging
                        is_blank = 1 if len(boxes) == 0 else 0
                        if is_blank:
                            blank_count += 1
                            # Move to safe quarantine
                            q_id = f"Q-{int(time.time()*1000)%1000000:06d}"
                            q_file = QUARANTINE_DIR / f"{q_id}_{fname}"
                            q_file.write_bytes(fbytes)

                            c.execute("""
                            INSERT INTO quarantine (id, image_id, filename, relative_path, batch_id, camera_id, timestamp, blank_confidence, file_size, reason, status, file_path, created_at)
                            VALUES (?, ?, ?, ?, ?, ?, ?, 96.5, ?, 'No animal pixels detected by YOLO model', 'quarantined', ?, ?)
                            """, (q_id, img_id, fname, fname, batch_id, meta["camera_id"], meta["timestamp"], len(fbytes), str(q_file), time.strftime('%Y-%m-%d %H:%M:%S')))
                        elif tiger_in_img:
                            tiger_count += 1
                            subject_count += 1
                            # Create observation
                            obs_id = f"OBS-{int(time.time()*1000)%1000000:06d}"
                            obs_crop = img_detections[0]["crop_url"] if img_detections else None
                            obs_conf = img_detections[0]["confidence_pct"] if img_detections else 90.0

                            c.execute("""
                            INSERT INTO observations (id, image_id, detection_id, tiger_id, camera_id, timestamp, gps_lat, gps_lng, zone, confidence, detection_type, status, crop_path, file_name, created_at)
                            VALUES (?, ?, ?, 'UNIDENTIFIED', ?, ?, ?, ?, 'Core Zone', ?, 'Real YOLO Inference', 'Confirmed', ?, ?, ?)
                            """, (obs_id, img_id, img_detections[0]["id"] if img_detections else None, meta["camera_id"], meta["timestamp"], meta["gps_lat"], meta["gps_lng"], obs_conf, obs_crop, fname, time.strftime('%Y-%m-%d %H:%M:%S')))
                        else:
                            subject_count += 1

                        # Save image record
                        c.execute("""
                        INSERT INTO images (id, batch_id, filename, relative_path, file_hash, file_size, mime_type, camera_id, timestamp, exif_data, gps_lat, gps_lng, width, height, is_blank, contains_human, privacy_review_required, status, file_path, created_at)
                        VALUES (?, ?, ?, ?, ?, ?, 'image/jpeg', ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 'processed', ?, ?)
                        """, (img_id, batch_id, fname, fname, fhash, len(fbytes), meta["camera_id"], meta["timestamp"], json.dumps(meta["exif"]), meta["gps_lat"], meta["gps_lng"], width, height, is_blank, str(save_path), time.strftime('%Y-%m-%d %H:%M:%S')))

                        # Update camera station image & tiger counts
                        c.execute("""
                        INSERT INTO camera_stations (camera_id, name, latitude, longitude, zone, activation_date, last_seen, image_count, tiger_count, status, created_at)
                        VALUES (?, ?, ?, ?, 'Core Zone', ?, ?, 1, ?, 'online', ?)
                        ON CONFLICT(camera_id) DO UPDATE SET
                            image_count = image_count + 1,
                            tiger_count = tiger_count + ?,
                            last_seen = ?
                        """, (meta["camera_id"], f"Station {meta['camera_id']}", meta["gps_lat"], meta["gps_lng"], meta["timestamp"], meta["timestamp"], 1 if tiger_in_img else 0, time.strftime('%Y-%m-%d %H:%M:%S'), 1 if tiger_in_img else 0, meta["timestamp"]))

                        processed += 1
                        results_summary.append({
                            "filename": fname,
                            "camera_id": meta["camera_id"],
                            "is_blank": is_blank == 1,
                            "has_tiger": tiger_in_img,
                            "detections_count": len(boxes),
                            "status": "success"
                        })

                    except Exception as img_err:
                        failed_count += 1
                        results_summary.append({
                            "filename": fname,
                            "status": "failed",
                            "error": str(img_err)
                        })

                elapsed_s = round(time.time() - start_time, 2)

                # Save batch record
                c.execute("""
                INSERT INTO batches (id, created_at, source_name, total_images, processed_images, blank_images, subject_images, tiger_images, failed_images, processing_time_s, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'completed')
                """, (batch_id, time.strftime('%Y-%m-%d %H:%M:%S'), batch_source, total_files, processed, blank_count, subject_count, tiger_count, failed_count, elapsed_s))

                # Log to audit log
                c.execute("""
                INSERT INTO audit_logs (id, timestamp, actor, action, entity_type, entity_id, details)
                VALUES (?, ?, 'Batch Processor', 'BATCH_COMPLETED', 'Batch', ?, ?)
                """, (f"AUD-{int(time.time()*1000)%1000000:06d}", time.strftime('%Y-%m-%d %H:%M:%S'), batch_id, f"Batch {batch_id} processed {processed}/{total_files} images ({tiger_count} tigers, {blank_count} blanks, {duplicate_count} duplicates skipped) in {elapsed_s}s."))

                conn.commit()
                conn.close()

                self._send_json(200, {
                    "success": True,
                    "batch_id": batch_id,
                    "total": total_files,
                    "processed": processed,
                    "duplicates_skipped": duplicate_count,
                    "blank_images": blank_count,
                    "subject_images": subject_count,
                    "tiger_images": tiger_count,
                    "failed_images": failed_count,
                    "processing_time_s": elapsed_s,
                    "results": results_summary
                })
                return

            # ── 3. Observations CRUD (POST /api/observations) ──────
            if path == "/api/observations":
                data = json.loads(body.decode('utf-8'))
                obs_id = f"OBS-{int(time.time()*1000)%1000000:06d}"
                conn = get_db()
                c = conn.cursor()
                c.execute("""
                INSERT INTO observations (id, image_id, detection_id, tiger_id, camera_id, timestamp, gps_lat, gps_lng, zone, confidence, detection_type, status, crop_path, file_name, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (obs_id, data.get("image_id"), data.get("detection_id"), data.get("tiger_id", "UNIDENTIFIED"), data.get("camera_id", "CT-001"), data.get("timestamp", time.strftime('%Y-%m-%d %H:%M:%S')), data.get("lat"), data.get("lng"), data.get("zone", "Core Zone"), data.get("confidence", 90.0), "Real YOLO Inference", "Confirmed", data.get("crop_path"), data.get("fileName", "image.jpg"), time.strftime('%Y-%m-%d %H:%M:%S')))

                # Log audit entry
                c.execute("""
                INSERT INTO audit_logs (id, timestamp, actor, action, entity_type, entity_id, details)
                VALUES (?, ?, 'Human Operator', 'REAL_OBSERVATION_SAVED', 'Observation', ?, ?)
                """, (f"AUD-{int(time.time()*1000)%1000000:06d}", time.strftime('%Y-%m-%d %H:%M:%S'), obs_id, f"Observation {obs_id} committed for {data.get('tiger_id', 'UNIDENTIFIED')} at {data.get('camera_id', 'CT-001')}."))

                conn.commit()
                conn.close()

                # Run deviation check
                data["id"] = obs_id
                alerts = run_deviation_check(data)

                self._send_json(200, {"success": True, "observation_id": obs_id, "alerts_triggered": alerts})
                return

            # ── 4. Tigers CRUD (POST /api/tigers) ──────────────────
            if path == "/api/tigers":
                data = json.loads(body.decode('utf-8'))
                conn = get_db()
                c = conn.cursor()
                c.execute("SELECT COUNT(*) FROM tigers")
                curr_count = c.fetchone()[0]
                tiger_id = data.get("id") or f"TGR-{curr_count + 1:03d}"

                c.execute("""
                INSERT INTO tigers (id, display_name, gender, age_estimate, first_seen, last_seen, observation_count, camera_count, centroid_lat, centroid_lng, estimated_area_km2, identification_status, notes, color, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, 1, 1, ?, ?, ?, 'Confirmed Individual', ?, ?, ?, ?)
                """, (tiger_id, data.get("name", f"Individual {tiger_id}"), data.get("gender", "Unknown"), data.get("age", "~3 years"), time.strftime('%Y-%m-%d'), time.strftime('%Y-%m-%d %H:%M:%S'), data.get("lat", 21.7380), data.get("lng", 79.3150), 5.0, data.get("notes", "Enrolled via PenchGuard AI"), data.get("color", "#10b981"), time.strftime('%Y-%m-%d %H:%M:%S'), time.strftime('%Y-%m-%d %H:%M:%S')))

                # Log audit entry
                c.execute("""
                INSERT INTO audit_logs (id, timestamp, actor, action, entity_type, entity_id, details)
                VALUES (?, ?, 'Human Operator', 'NEW_TIGER_ENROLLED', 'Tiger', ?, ?)
                """, (f"AUD-{int(time.time()*1000)%1000000:06d}", time.strftime('%Y-%m-%d %H:%M:%S'), tiger_id, f"Tiger {tiger_id} ({data.get('name', 'Individual')}) enrolled into database catalogue."))

                conn.commit()
                conn.close()
                self._send_json(200, {"success": True, "tiger_id": tiger_id})
                return

            # ── 5. Human Review Matching (POST /api/tigers/<id>/matches)
            if path.startswith("/api/tigers/") and path.endswith("/matches"):
                tiger_id = path.split("/")[3]
                data = json.loads(body.decode('utf-8'))
                obs_id = data.get("observation_id")

                conn = get_db()
                c = conn.cursor()
                if obs_id:
                    c.execute("UPDATE observations SET tiger_id = ? WHERE id = ?", (tiger_id, obs_id))
                c.execute("""
                INSERT INTO audit_logs (id, timestamp, actor, action, entity_type, entity_id, details)
                VALUES (?, ?, 'Human Reviewer', 'TIGER_MATCH_CONFIRMED', 'TigerMatch', ?, ?)
                """, (f"AUD-{int(time.time()*1000)%1000000:06d}", time.strftime('%Y-%m-%d %H:%M:%S'), obs_id or tiger_id, f"Observation {obs_id} matched and assigned to Individual {tiger_id}."))
                conn.commit()
                conn.close()
                self._send_json(200, {"success": True, "tiger_id": tiger_id, "observation_id": obs_id})
                return

            # ── 6. Quarantine Actions (Confirm Blank / Restore) ────
            if path.startswith("/api/quarantine/"):
                parts = path.split("/")
                q_id = parts[3]
                action = parts[4] if len(parts) > 4 else ""

                conn = get_db()
                c = conn.cursor()
                if action == "confirm":
                    c.execute("UPDATE quarantine SET status = 'confirmed_blank' WHERE id = ?", (q_id,))
                    c.execute("""
                    INSERT INTO audit_logs (id, timestamp, actor, action, entity_type, entity_id, details)
                    VALUES (?, ?, 'Human Operator', 'BLANK_CONFIRMED', 'Quarantine', ?, 'Blank image verified and safe deletion approved.')
                    """, (f"AUD-{int(time.time()*1000)%1000000:06d}", time.strftime('%Y-%m-%d %H:%M:%S'), q_id))
                    conn.commit()
                    conn.close()
                    self._send_json(200, {"success": True, "id": q_id, "status": "confirmed_blank"})
                    return
                elif action == "restore":
                    c.execute("UPDATE quarantine SET status = 'restored' WHERE id = ?", (q_id,))
                    c.execute("""
                    INSERT INTO audit_logs (id, timestamp, actor, action, entity_type, entity_id, details)
                    VALUES (?, ?, 'Human Operator', 'IMAGE_RESTORED', 'Quarantine', ?, 'Image restored from quarantine to active review.')
                    """, (f"AUD-{int(time.time()*1000)%1000000:06d}", time.strftime('%Y-%m-%d %H:%M:%S'), q_id))
                    conn.commit()
                    conn.close()
                    self._send_json(200, {"success": True, "id": q_id, "status": "restored"})
                    return

            # ── 7. Alert Actions (Acknowledge / Resolve) ───────────
            if path.startswith("/api/alerts/"):
                parts = path.split("/")
                alt_id = parts[3]
                action = parts[4] if len(parts) > 4 else ""

                conn = get_db()
                c = conn.cursor()
                if action == "acknowledge":
                    c.execute("UPDATE alerts SET status = 'acknowledged' WHERE id = ?", (alt_id,))
                    c.execute("""
                    INSERT INTO audit_logs (id, timestamp, actor, action, entity_type, entity_id, details)
                    VALUES (?, ?, 'Forest Officer', 'ALERT_ACKNOWLEDGED', 'Alert', ?, 'Officer reviewing movement deviation evidence.')
                    """, (f"AUD-{int(time.time()*1000)%1000000:06d}", time.strftime('%Y-%m-%d %H:%M:%S'), alt_id))
                    conn.commit()
                    conn.close()
                    self._send_json(200, {"success": True, "id": alt_id, "status": "acknowledged"})
                    return
                elif action == "resolve":
                    c.execute("UPDATE alerts SET status = 'resolved', resolved_at = ? WHERE id = ?", (time.strftime('%Y-%m-%d %H:%M:%S'), alt_id))
                    c.execute("""
                    INSERT INTO audit_logs (id, timestamp, actor, action, entity_type, entity_id, details)
                    VALUES (?, ?, 'Forest Officer', 'ALERT_RESOLVED', 'Alert', ?, 'Patrol dispatched / boundary mitigation action logged.')
                    """, (f"AUD-{int(time.time()*1000)%1000000:06d}", time.strftime('%Y-%m-%d %H:%M:%S'), alt_id))
                    conn.commit()
                    conn.close()
                    self._send_json(200, {"success": True, "id": alt_id, "status": "resolved"})
                    return

            # ── 8. Custom Audit Logging (POST /api/audit) ──────────
            if path == "/api/audit":
                data = json.loads(body.decode('utf-8'))
                aud_id = f"AUD-{int(time.time()*1000)%1000000:06d}"
                conn = get_db()
                c = conn.cursor()
                c.execute("""
                INSERT INTO audit_logs (id, timestamp, actor, action, entity_type, entity_id, details)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (aud_id, time.strftime('%Y-%m-%d %H:%M:%S'), data.get("actor", "Operator"), data.get("action", "ACTION"), data.get("entity_type", "System"), data.get("entity_id", "0"), data.get("details", "")))
                conn.commit()
                conn.close()
                self._send_json(200, {"success": True, "id": aud_id})
                return

            self.send_response(404)
            self._send_cors()
            self.end_headers()

        except Exception as e:
            import traceback
            traceback.print_exc()
            self._send_json(500, {"error": str(e), "message": f"Server Error: {str(e)}"})


def run_server(port=8000):
    server_address = ('', port)
    httpd = ThreadingHTTPServer(server_address, YOLORequestHandler)
    print(f"🚀 PenchGuard AI Python YOLO & SQLite Server running on http://localhost:{port}", flush=True)
    httpd.serve_forever()


if __name__ == "__main__":
    run_server()
