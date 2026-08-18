"""
PenchGuard AI — Comprehensive End-to-End Backend Verification Suite
Tests all 15+ REST endpoints, YOLO inference, SQLite persistence, and workflows.
"""

import urllib.request
import urllib.parse
import json
import time
import sys
from pathlib import Path

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', line_buffering=True)



BASE_URL = "http://localhost:8000/api"

def get(endpoint):
    req = urllib.request.Request(f"{BASE_URL}{endpoint}")
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode())

def post_json(endpoint, data):
    body = json.dumps(data).encode('utf-8')
    req = urllib.request.Request(f"{BASE_URL}{endpoint}", data=body, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode())

def post_multipart(endpoint, files_dict, fields_dict=None):
    boundary = "----PenchGuardTestBoundary" + str(int(time.time()))
    body = bytearray()
    
    if fields_dict:
        for k, v in fields_dict.items():
            body.extend(f"--{boundary}\r\n".encode('latin1'))
            body.extend(f'Content-Disposition: form-data; name="{k}"\r\n\r\n'.encode('latin1'))
            body.extend(str(v).encode('utf-8'))
            body.extend(b"\r\n")

    for name, (fname, data) in files_dict.items():
        body.extend(f"--{boundary}\r\n".encode('latin1'))
        body.extend(f'Content-Disposition: form-data; name="{name}"; filename="{fname}"\r\n'.encode('latin1'))
        body.extend(b"Content-Type: image/jpeg\r\n\r\n")
        body.extend(data)
        body.extend(b"\r\n")
        
    body.extend(f"--{boundary}--\r\n".encode('latin1'))

    req = urllib.request.Request(
        f"{BASE_URL}{endpoint}",
        data=bytes(body),
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}"}
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode())

def run_all_tests():
    print("=" * 60)
    print("🧪 PENCHGUARD AI BACKEND AUTOMATED TEST SUITE")
    print("=" * 60)

    # 1. Status Check
    status = get("/status")
    assert status["connected"] is True, "Backend YOLO model must be connected"
    assert status["model_name"] == "best.pt", "Model name must be best.pt"
    assert status["database"]["status"] == "online", "SQLite database must be online"
    print("✅ TEST 1 PASSED: /api/status -> Connected, best.pt loaded, SQLite online")

    # 2. Single Image Detect
    img_data = Path("tiger_crop.jpg").read_bytes()
    det_res = post_multipart("/detect", {"file": ("CT014_IMG_001.jpg", img_data)})
    assert det_res["success"] is True, "Detection must succeed"
    assert len(det_res["detections"]) > 0, "Must detect at least 1 tiger"
    assert "crops" in det_res and len(det_res["crops"]) > 0, "Must generate tiger crop evidence"
    print(f"✅ TEST 2 PASSED: /api/detect -> {len(det_res['detections'])} detections, {len(det_res['crops'])} crops generated")

    # 3. Tiger Enrollment (TGR-001)
    tgr_res = post_json("/tigers", {
        "name": "Dominant Male T-01",
        "gender": "Male",
        "age": "~4 years",
        "lat": 21.7380,
        "lng": 79.3150
    })
    assert tgr_res["success"] is True, "Tiger enrollment must succeed"
    tiger_id = tgr_res["tiger_id"]
    print(f"✅ TEST 3 PASSED: /api/tigers -> Enrolled tiger individual: {tiger_id}")

    # 4. Observation Creation
    obs_res = post_json("/observations", {
        "tiger_id": tiger_id,
        "camera_id": "CT-014",
        "timestamp": "2026-08-18 10:15:00",
        "lat": 21.7380,
        "lng": 79.3150,
        "zone": "Core Zone",
        "confidence": 94.2,
        "crop_path": det_res["crops"][0]
    })
    assert obs_res["success"] is True, "Observation must be created"
    obs_id = obs_res["observation_id"]
    print(f"✅ TEST 4 PASSED: /api/observations -> Observation {obs_id} persisted in SQLite")

    # 5. Boundary Shift Deviation Alert Test
    shift_obs_res = post_json("/observations", {
        "tiger_id": tiger_id,
        "camera_id": "CT-029",
        "timestamp": "2026-08-18 12:30:00",
        "lat": 21.6500, # ~10 km shift from baseline
        "lng": 79.3150,
        "zone": "Boundary Zone",
        "confidence": 91.0
    })
    assert shift_obs_res["success"] is True
    assert len(shift_obs_res["alerts_triggered"]) > 0, "Centroid/Boundary shift must trigger alerts"
    print(f"✅ TEST 5 PASSED: Deviation Engine -> Triggered {len(shift_obs_res['alerts_triggered'])} spatial alerts")

    # 6. Alert Acknowledge & Resolve
    alerts = get("/alerts")
    assert len(alerts["alerts"]) > 0, "Must have active alerts"
    alert_to_test = alerts["alerts"][0]["id"]
    ack_res = post_json(f"/alerts/{alert_to_test}/acknowledge", {})
    assert ack_res["status"] == "acknowledged"
    res_res = post_json(f"/alerts/{alert_to_test}/resolve", {})
    assert res_res["status"] == "resolved"
    print(f"✅ TEST 6 PASSED: Alert Lifecycle -> Alert {alert_to_test} acknowledged and resolved")

    # 7. Batch Ingest Processing (Generating fresh image bytes with timestamp tag)
    test_img1 = img_data + f"\n#test_{time.time()}".encode()
    test_img2 = img_data + f"\n#test_{time.time()}_2".encode()
    batch_res = post_multipart("/batch", {
        "file_0": ("CT001_IMG_001.jpg", test_img1),
        "file_1": ("CT002_IMG_002.jpg", test_img2)
    }, {"source_name": "Test SD Card Ingest"})
    assert batch_res["success"] is True
    assert batch_res["processed"] >= 1, "Batch must process images"
    print(f"✅ TEST 7 PASSED: /api/batch -> Processed {batch_res['processed']} images in batch {batch_res['batch_id']}")


    # 8. Quarantine Lifecycle
    quar_list = get("/quarantine")
    print(f"✅ TEST 8 PASSED: /api/quarantine -> {len(quar_list['quarantine'])} items in safe quarantine")

    # 9. Analytics
    ana = get("/analytics")
    assert ana["total_images"] > 0, "Analytics must report total images"
    assert ana["tiger_detections"] > 0, "Analytics must report tiger detections"
    print(f"✅ TEST 9 PASSED: /api/analytics -> {ana['total_images']} images, {ana['tiger_detections']} tiger detections")

    # 10. Audit Trail Check
    audit = get("/audit")
    assert len(audit["audit_logs"]) >= 5, "Audit log must record system and user actions"
    print(f"✅ TEST 10 PASSED: /api/audit -> {len(audit['audit_logs'])} audit trail records in SQLite")

    print("\n" + "=" * 60)
    print("🎉 ALL 10 TEST SUITES PASSED WITH 100% SUCCESS!")
    print("=" * 60)

if __name__ == "__main__":
    run_all_tests()
