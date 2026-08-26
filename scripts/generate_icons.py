import os
from PIL import Image

def generate_icons():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    logo_path = os.path.join(base_dir, "logo.png")
    
    if not os.path.exists(logo_path):
        print(f"Error: {logo_path} not found")
        return
        
    img = Image.open(logo_path).convert("RGBA")
    
    # 1. Desktop Assets
    assets_dir = os.path.join(base_dir, "assets")
    os.makedirs(assets_dir, exist_ok=True)
    
    img_512 = img.resize((512, 512), Image.Resampling.LANCZOS)
    img_512.save(os.path.join(assets_dir, "icon.png"), "PNG")
    
    # Save Windows multi-res .ico
    ico_sizes = [(256, 256), (128, 128), (64, 64), (48, 48), (32, 32), (16, 16)]
    img.save(os.path.join(assets_dir, "icon.ico"), format="ICO", sizes=ico_sizes)
    print("Generated desktop icon.png and icon.ico")
    
    # 2. Android Mipmap Icons
    res_dir = os.path.join(base_dir, "android", "app", "src", "main", "res")
    mipmap_configs = {
        "mipmap-mdpi": 48,
        "mipmap-hdpi": 72,
        "mipmap-xhdpi": 96,
        "mipmap-xxhdpi": 144,
        "mipmap-xxxhdpi": 192,
    }
    
    for folder, size in mipmap_configs.items():
        folder_path = os.path.join(res_dir, folder)
        os.makedirs(folder_path, exist_ok=True)
        resized = img.resize((size, size), Image.Resampling.LANCZOS)
        resized.save(os.path.join(folder_path, "ic_launcher.png"), "PNG")
        resized.save(os.path.join(folder_path, "ic_launcher_round.png"), "PNG")
        print(f"Generated {folder} ({size}x{size})")
        
    drawable_dir = os.path.join(res_dir, "drawable")
    os.makedirs(drawable_dir, exist_ok=True)
    img.resize((128, 128), Image.Resampling.LANCZOS).save(os.path.join(drawable_dir, "app_logo.png"), "PNG")
    print("Generated Android drawables and mipmaps successfully!")

if __name__ == "__main__":
    generate_icons()
