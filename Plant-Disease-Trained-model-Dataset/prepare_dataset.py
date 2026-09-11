"""
PlantVillage Dataset Splitter — No Data Leakage Edition
--------------------------------------------------------
Combines color + grayscale + segmented while ensuring that
all three versions of the SAME leaf always land in the SAME
split (train / val / test). This prevents the model from
"cheating" by seeing a leaf in one modality during training
and then being tested on the same leaf in another modality.

Output folder structure
-----------------------
train_val_test/
  train/
    Apple___Apple_scab/
      color_image001.jpg
      grayscale_image001.jpg
      segmented_image001.jpg
      ...
  val/
    ...
  test/
    ...
"""

import os
import shutil
import random
from pathlib import Path

# ── Config ──────────────────────────────────────────────────────────────
BASE_DIR    = Path(__file__).parent          # folder containing this script
SOURCES     = ["color", "grayscale", "segmented"]
OUTPUT_ROOT = BASE_DIR / "train_val_test"
SPLITS      = {"train": 0.80, "val": 0.10, "test": 0.10}
SEED        = 42
IMAGE_EXTS  = {".jpg", ".jpeg", ".png", ".bmp", ".tif", ".tiff"}
# ────────────────────────────────────────────────────────────────────────

random.seed(SEED)


def get_classes(source: str) -> list[str]:
    """Return sorted list of class folder names in a source directory."""
    src_path = BASE_DIR / source
    return sorted(
        d for d in os.listdir(src_path)
        if (src_path / d).is_dir() and not d.startswith(".")
    )


def split_filenames(filenames: list[str]) -> dict[str, list[str]]:
    """
    Randomly split a list of bare filenames into train/val/test groups.
    The split is done on FILENAMES (leaf identities), so all modalities
    of the same leaf will go into the same bucket.
    """
    filenames = list(filenames)
    random.shuffle(filenames)
    n = len(filenames)
    n_train = int(n * SPLITS["train"])
    n_val   = int(n * SPLITS["val"])
    return {
        "train": filenames[:n_train],
        "val":   filenames[n_train : n_train + n_val],
        "test":  filenames[n_train + n_val :],
    }


def main():
    # Verify all sources share the same class set
    all_classes = [get_classes(src) for src in SOURCES]
    assert all(c == all_classes[0] for c in all_classes), \
        "Mismatch in class folders across sources!"
    classes = all_classes[0]
    print(f"Found {len(classes)} classes, {len(SOURCES)} modalities.\n")

    # Wipe & recreate output tree
    if OUTPUT_ROOT.exists():
        print(f"Removing existing output at {OUTPUT_ROOT} …")
        shutil.rmtree(OUTPUT_ROOT)

    for split_name in SPLITS:
        for cls in classes:
            (OUTPUT_ROOT / split_name / cls).mkdir(parents=True, exist_ok=True)

    total_copied = 0

    for cls in classes:
        # Gather all filenames that exist in the COLOR folder for this class
        # (we use color as the "reference" modality to decide split boundaries)
        color_dir = BASE_DIR / "color" / cls
        color_files = sorted(
            f for f in os.listdir(color_dir)
            if Path(f).suffix.lower() in IMAGE_EXTS
        )

        # Decide which split each leaf goes into (based on filename / leaf identity)
        split_map = split_filenames([Path(f).stem for f in color_files])
        stem_to_split = {
            stem: split_name
            for split_name, stems in split_map.items()
            for stem in stems
        }

        for src_name in SOURCES:
            src_dir = BASE_DIR / src_name / cls
            if not src_dir.exists():
                print(f"  [WARN] Missing: {src_dir} — skipping")
                continue

            for fname in os.listdir(src_dir):
                if Path(fname).suffix.lower() not in IMAGE_EXTS:
                    continue

                stem = Path(fname).stem
                split_name = stem_to_split.get(stem)
                if split_name is None:
                    # File exists in grayscale/segmented but not in color — treat as train
                    split_name = "train"

                # Prefix filename with modality to avoid name collisions
                new_name = f"{src_name}_{fname}"
                dest = OUTPUT_ROOT / split_name / cls / new_name
                shutil.copy2(src_dir / fname, dest)
                total_copied += 1

        # Progress per class
        n_train = len(split_map["train"])
        n_val   = len(split_map["val"])
        n_test  = len(split_map["test"])
        print(f"  {cls:55s}  leaves → train:{n_train:4d}  val:{n_val:4d}  test:{n_test:4d}")

    copied_per_modality = total_copied // len(SOURCES)
    print(f"\n✅  Done!  {total_copied} files copied "
          f"({copied_per_modality} unique leaves × {len(SOURCES)} modalities).")
    print(f"Output: {OUTPUT_ROOT}")


if __name__ == "__main__":
    main()
