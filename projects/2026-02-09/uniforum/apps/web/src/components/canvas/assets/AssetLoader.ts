export class AssetLoader {
  private images: Map<string, HTMLImageElement> = new Map();

  constructor() {
    this.load();
  }

  private async load() {
    // Load Map Tiles
    await this.loadImage('map_bg', '/city.png');

    // Load Characters (1-31)
    const characters = Array.from({ length: 31 }, (_, i) => i + 1);
    await Promise.all(characters.map(i => 
      this.loadImage(`agent_${i}`, `/sprites/sprite_split/character_${i}/character_${i}_frame32x32.png`)
    ));
    
    console.log('Assets loaded:', this.images.size);
  }

  public loadImage(key: string, src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, _reject) => {
      if (this.images.has(key)) {
        resolve(this.images.get(key)!);
        return;
      }

      const img = new Image();
      img.src = src;
      img.onload = () => {
        this.images.set(key, img);
        resolve(img);
      };
      img.onerror = (err) => {
        console.warn(`Failed to load image: ${src}`, err);
        // We resolve anyway so execution continues, handling missing images gracefully
        resolve(img); // Resolve with broken image to prevent crash
      };
    });
  }

  public getImage(key: string): HTMLImageElement | undefined {
    return this.images.get(key);
  }
}
