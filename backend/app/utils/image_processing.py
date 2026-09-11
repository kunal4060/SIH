import io
import os
import uuid
from pathlib import Path
from PIL import Image
import numpy as np
from backend.app.config.settings import settings

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}
MAX_FILE_SIZE = 15 * 1024 * 1024  # 15 MB

def validate_and_save_image(file_bytes: bytes, filename: str) -> str:
    """Validates image file bytes and saves to the uploads directory. Returns relative path."""
    if len(file_bytes) > MAX_FILE_SIZE:
        raise ValueError("Image file size exceeds maximum allowed size of 15MB")
    
    ext = Path(filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        ext = ".jpg"

    try:
        image = Image.open(io.BytesIO(file_bytes))
        image.verify()  # Verify image integrity
        # Re-open after verify as per PIL documentation
        image = Image.open(io.BytesIO(file_bytes))
        if image.mode != "RGB":
            image = image.convert("RGB")
    except Exception as e:
        raise ValueError(f"Invalid or corrupted image file: {str(e)}")

    unique_filename = f"scan_{uuid.uuid4().hex[:12]}{ext}"
    target_path = settings.UPLOAD_DIR / unique_filename
    image.save(target_path, quality=90, optimize=True)

    return f"/uploads/plant_scans/{unique_filename}"

def preprocess_image_for_resnet(image_path_or_bytes, target_size=(75, 75)):
    """Preprocesses an image for ResNet50 input (75x75 or 224x224, normalized)."""
    if isinstance(image_path_or_bytes, (str, Path)):
        img = Image.open(image_path_or_bytes)
    elif isinstance(image_path_or_bytes, bytes):
        img = Image.open(io.BytesIO(image_path_or_bytes))
    else:
        img = image_path_or_bytes

    if img.mode != "RGB":
        img = img.convert("RGB")

    img_resized = img.resize(target_size, Image.Resampling.BILINEAR)
    img_array = np.array(img_resized, dtype=np.float32)
    
    # ResNet50 preprocessing: BGR conversion and zero-centering per-channel with ImageNet means
    # Mean values: [103.939, 116.779, 123.68] for [B, G, R]
    img_bgr = img_array[..., ::-1].copy()
    img_bgr[..., 0] -= 103.939
    img_bgr[..., 1] -= 116.779
    img_bgr[..., 2] -= 123.68
    
    # Add batch dimension: (1, height, width, 3)
    img_batch = np.expand_dims(img_bgr, axis=0)
    return img_batch
