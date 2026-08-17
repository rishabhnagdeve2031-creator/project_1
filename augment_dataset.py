import os
import cv2
import numpy as np

train_img_dir = r"C:\Users\VICTUS\OneDrive\Desktop\tiger train dataset\tigers2\train\images"
train_lbl_dir = r"C:\Users\VICTUS\OneDrive\Desktop\tiger train dataset\tigers2\train\labels"

# Get initial list of positive tiger images (ignoring neg_ images)
orig_images = [f for f in os.listdir(train_img_dir) if f.endswith(('.jpg', '.jpeg', '.png')) and not f.startswith('neg_') and not f.startswith('aug_')]

print(f"Found {len(orig_images)} original positive tiger training images.")

added = 0
for fname in orig_images:
    base_name = os.path.splitext(fname)[0]
    img_path = os.path.join(train_img_dir, fname)
    lbl_path = os.path.join(train_lbl_dir, base_name + ".txt")

    if not os.path.exists(lbl_path):
        continue

    # Read label lines
    with open(lbl_path, "r") as lf:
        lines = [line.strip() for line in lf if line.strip()]

    if not lines:
        continue # empty label (negative sample)

    img = cv2.imread(img_path)
    if img is None:
        continue

    h, w = img.shape[:2]

    # 1. Horizontal Flip
    flipped_img = cv2.flip(img, 1)
    flipped_lines = []
    for line in lines:
        parts = line.split()
        cls_id = parts[0]
        xc, yc, bw, bh = map(float, parts[1:5])
        # Flip x center
        xc_new = round(1.0 - xc, 6)
        flipped_lines.append(f"{cls_id} {xc_new} {yc} {bw} {bh}")

    flip_img_name = f"aug_flip_{fname}"
    flip_lbl_name = f"aug_flip_{base_name}.txt"
    cv2.imwrite(os.path.join(train_img_dir, flip_img_name), flipped_img)
    with open(os.path.join(train_lbl_dir, flip_lbl_name), "w") as out_f:
        out_f.write("\n".join(flipped_lines) + "\n")
    added += 1

    # 2. Brightness Adjustment (+/- 25%)
    bright_img = cv2.convertScaleAbs(img, alpha=1.15, beta=15)
    bright_img_name = f"aug_bright_{fname}"
    bright_lbl_name = f"aug_bright_{base_name}.txt"
    cv2.imwrite(os.path.join(train_img_dir, bright_img_name), bright_img)
    with open(os.path.join(train_lbl_dir, bright_lbl_name), "w") as out_f:
        out_f.write("\n".join(lines) + "\n")
    added += 1

    # 3. Contrast / Darkness Adjustment (Night camera-trap simulation)
    dark_img = cv2.convertScaleAbs(img, alpha=0.85, beta=-10)
    dark_img_name = f"aug_dark_{fname}"
    dark_lbl_name = f"aug_dark_{base_name}.txt"
    cv2.imwrite(os.path.join(train_img_dir, dark_img_name), dark_img)
    with open(os.path.join(train_lbl_dir, dark_lbl_name), "w") as out_f:
        out_f.write("\n".join(lines) + "\n")
    added += 1

print(f"Successfully generated {added} augmented positive tiger images & labels!")
