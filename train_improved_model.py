import os
import torch
from ultralytics import YOLO

def main():
    print("=" * 60)
    print("🚀 STARTING PENCHGUARD AI TIGER MODEL RETRAINING")
    print("   Dataset: Augmented Tiger Images + Hard Negative Samples (Horses, Deer, Cattle, Leopards)")
    print("   Base Model: YOLOv8s (Small - 11.2M params)")
    print("=" * 60)

    yaml_path = r"C:\Users\VICTUS\OneDrive\Desktop\tiger train dataset\tigers2\data.yaml"
    
    # Initialize YOLOv8s base model
    model = YOLO("yolov8s.pt")

    # Train model
    results = model.train(
        data=yaml_path,
        epochs=60,
        imgsz=640,
        batch=16,
        name="tigers2_improved",
        project=r"C:\Users\VICTUS\OneDrive\Desktop\tiger train dataset\runs\detect",
        exist_ok=True,
        pretrained=True,
        optimizer="AdamW",
        lr0=0.001,
        lrf=0.01,
        hsv_h=0.015,
        hsv_s=0.7,
        hsv_v=0.4,
        degrees=10.0,
        translate=0.1,
        scale=0.5,
        fliplr=0.5,
        mosaic=1.0,
        mixup=0.1,
        verbose=True,
        workers=2
    )

    print("\n✅ RETRAINING COMPLETE!")
    best_weights = r"C:\Users\VICTUS\OneDrive\Desktop\tiger train dataset\runs\detect\tigers2_improved\weights\best.pt"
    if os.path.exists(best_weights):
        print(f"🎯 NEW TRAINED BEST WEIGHTS SAVED TO:\n   {best_weights}")
    else:
        print("⚠️ Best weights file path check failed")

if __name__ == "__main__":
    main()
