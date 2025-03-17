from PIL import Image
import os

# Configuration
SHIFT_PIXELS = -1
IMAGE_DIR = "src-tauri/android-icons/xxxhdpi/"  # Input directory for original icons
OUTPUT_DIR = "src-tauri/android-icons-fixed/xxxhdpi"  # Output directory for corrected icons

# Ensure output directory exists
os.makedirs(OUTPUT_DIR, exist_ok=True)

# List of image files to process
icon_files = [
    "ic_launcher.png",
    "ic_launcher_foreground.png",
    "ic_launcher_background.png",
]

# Process each image
for icon in icon_files:
    input_path = os.path.join(IMAGE_DIR, icon)
    output_path = os.path.join(OUTPUT_DIR, icon)

    # Open the image
    img = Image.open(input_path).convert("RGBA")

    # Create a blank image with transparency
    shifted_img = Image.new("RGBA", img.size, (0, 0, 0, 0))

    # Paste the original image onto the new one, shifted right
    shifted_img.paste(img, (SHIFT_PIXELS, 0))

    # Save the corrected image
    shifted_img.save(output_path, "PNG")

    print(f"Shifted {icon} -> {output_path}")
