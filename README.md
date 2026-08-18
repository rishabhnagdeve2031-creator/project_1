# PenchGuard AI — TigerMarg

Offline-first camera-trap intelligence platform for Pench Tiger Reserve. Uses a custom-trained YOLOv8 tiger detector (`models/best.pt`), a persistent SQLite database (`data/penchguard.db`), automated metadata extraction, reversible safe blank quarantine, explainable spatial deviation analytics, and human review verification.

---

## 🏗 System Architecture & Workflow

```
RAW CAMERA-TRAP IMAGES
         ↓
INGESTION & METADATA EXTRACTION (EXIF, Station ID, Timestamp, GPS, SHA-256 Hash)
         ↓
YOLOv8 TIGER INFERENCE (models/best.pt)
         ↓
BLANK / SUBJECT TRIAGE
   ├── Blanks (No Animals) → SAFE QUARANTINE (Reversible, Storage Calculation)
   └── Tigers Detected    → AUTO-EXTRACTED FLANK/EVIDENCE CROPS
                                  ↓
                       HUMAN REVIEW / RE-ID STRIPE MATCHING
                                  ↓
                       PERSISTENT SQLITE DATABASE (Tigers, Observations, Cameras)
                                  ↓
                       SPATIAL OCCUPANCY & DEVIATION ENGINE
                                  ↓
                       EXPLAINABLE ALERTS & AUDIT TRAIL
```

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19 + Vite 8 |
| **Styling** | Vanilla CSS (Dark Glassmorphic Nature Theme) |
| **Mapping** | Leaflet / Google Maps API + Point-in-Polygon Engine |
| **Backend** | Python 3.12 (Standard Library `http.server` + `sqlite3`) |
| **AI Inference** | Ultralytics YOLOv8 (`models/best.pt`), PyTorch |
| **GPU Acceleration** | NVIDIA CUDA (RTX 3050 or compatible, CPU fallback) |
| **Database** | SQLite (`data/penchguard.db`) with 10 persistent tables |

---

## 🚀 Setup & Execution

### 1. Prerequisites

- **Node.js** (v18+)
- **Python 3.12** with pip
- **NVIDIA GPU + CUDA** (optional, automatic CPU fallback)

### 2. Python Dependencies

```bash
pip install ultralytics torch torchvision pillow
```

### 3. Model Location

Ensure your trained tiger model is at:

```
project_1/
  models/
    best.pt    ← Trained YOLOv8 Tiger Detector (Single class: Tiger)
```

> ⚠️ Note: The YOLO model is a **Tiger Detector**. It detects tiger presence, bounding boxes, and confidence. Individual tiger stripe identification is handled via **Human Review / Stripe Re-ID** workflows to maintain scientific honesty.

### 4. Environment Variables (Optional)

| Variable | Default | Description |
|---|---|---|
| `PENCH_MODEL_PATH` | `./models/best.pt` | Path to trained weights |
| `YOLO_CONF` | `0.25` | Default detection confidence threshold |

---

## 💻 Running the Application

**Terminal 1 — Python SQLite & YOLO Backend:**

```bash
py -3.12 server.py
```

Expected Startup Output:
```
📦 SQLite database initialized: ...\data\penchguard.db
🔄 Loading YOLO model from: ...\models\best.pt
✅ SUCCESSFULLY LOADED YOLO MODEL: ...\models\best.pt
   Device: CUDA / CPU
   Classes: {0: 'tiger'}
🚀 PenchGuard AI Python YOLO & SQLite Server running on http://localhost:8000
```

**Terminal 2 — React Frontend:**

```bash
npm install
npm run dev
```

Open your browser at: **[http://localhost:5173](http://localhost:5173)**

---

## 📊 SQLite Database Schema (`data/penchguard.db`)

The persistent datastore contains 10 structured tables:

1. **`batches`**: Ingestion batches, total images, processing duration, blank/tiger counts.
2. **`images`**: Filename, SHA-256 hash, EXIF metadata, camera ID, timestamp, GPS coordinates.
3. **`detections`**: Bounding box coordinates (`x1`, `y1`, `x2`, `y2`), YOLO confidence, crop image path.
4. **`observations`**: Confirmed sightings linked to camera stations, GPS, zones, and tiger individuals.
5. **`tigers`**: Individual catalogue (TGR-001, TGR-002...), age estimate, centroid GPS, occupancy area km².
6. **`tiger_matches`**: Human review queue for stripe pattern verification.
7. **`camera_stations`**: Deployed stations, latitude/longitude, zones, activation date, detection stats.
8. **`quarantine`**: Reversible quarantine store for blank frames with safe confirmation lifecycle.
9. **`alerts`**: Spatial movement deviations (Range centroid shift > 5km/15km, Boundary breaches).
10. **`audit_logs`**: System and human decision audit trail.

---

## 🌐 REST API Reference (`http://localhost:8000/api`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/status` | System health, model info, device, SQLite record counts |
| `POST` | `/api/detect` | Single image upload → EXIF + YOLO inference + crop generation |
| `POST` | `/api/batch` | Multi-image / folder ingest with deduplication & quarantine |
| `GET` | `/api/batches` | Ingestion batch history |
| `GET` | `/api/observations` | Persistent sightings list |
| `POST` | `/api/observations` | Save / commit real observation |
| `GET` | `/api/tigers` | Enrolled tiger individual catalogue |
| `POST` | `/api/tigers` | Enroll new individual (TGR-XXX) |
| `POST` | `/api/tigers/:id/matches` | Confirm human review match |
| `GET` | `/api/cameras` | Camera trap station records |
| `GET` | `/api/quarantine` | Quarantined blank frames |
| `POST` | `/api/quarantine/:id/confirm` | Confirm blank for safe deletion |
| `POST` | `/api/quarantine/:id/restore` | Restore image to active stream |
| `GET` | `/api/alerts` | Active movement deviation alerts |
| `POST` | `/api/alerts/:id/acknowledge` | Acknowledge alert |
| `POST` | `/api/alerts/:id/resolve` | Resolve alert |
| `GET` | `/api/audit` | Audit log trail |
| `GET` | `/api/analytics` | Aggregated telemetry & zone distributions |
| `GET` | `/api/export/:type` | Export CSV reports (`observations.csv`, etc.) |
| `GET` | `/api/media/:type/:file` | Serve crops and uploaded imagery |

---

## 🧪 Automated Testing

Run the end-to-end test suite:

```bash
py -3.12 test_backend_suite.py
```

Frontend production build check:

```bash
npm run build
```
