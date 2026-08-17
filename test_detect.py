import csv

csv_path = r"C:\Users\VICTUS\OneDrive\Desktop\tiger train dataset\runs\detect\tigers2_train-2\results.csv"
with open(csv_path) as f:
    reader = csv.DictReader(f)
    rows = list(reader)

print(f"Total epochs trained: {len(rows)}")
print()
print("Epoch | Precision | Recall  | mAP50  | mAP50-95")
print("-" * 55)
for r in rows[-10:]:
    ep = r["epoch"].strip()
    prec = float(r["metrics/precision(B)"].strip())
    rec = float(r["metrics/recall(B)"].strip())
    map50 = float(r["metrics/mAP50(B)"].strip())
    map95 = float(r["metrics/mAP50-95(B)"].strip())
    print(f"  {ep:>3}  |   {prec:.4f}  |  {rec:.4f} | {map50:.4f} |   {map95:.4f}")
