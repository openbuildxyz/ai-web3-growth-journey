export class Camera {
  public x: number = 0;
  public y: number = 0;
  public scale: number = 1;

  private minScale = 0.5;
  private maxScale = 3.0;

  constructor() {}

  public zoom(amount: number, centerX: number, centerY: number) {
    const oldScale = this.scale;
    let newScale = this.scale * (1 - amount * 0.001);
    
    // Clamp
    newScale = Math.max(this.minScale, Math.min(this.maxScale, newScale));
    
    // Zoom towards center
    const scaleRatio = newScale / oldScale;
    this.x = centerX - (centerX - this.x) * scaleRatio;
    this.y = centerY - (centerY - this.y) * scaleRatio;
    
    this.scale = newScale;
  }

  public pan(dx: number, dy: number) {
    this.x -= dx;
    this.y -= dy;
  }

  public transform(ctx: CanvasRenderingContext2D) {
    ctx.translate(this.x, this.y);
    ctx.scale(this.scale, this.scale);
  }

  public screenToWorld(screenX: number, screenY: number): { x: number, y: number } {
    return {
      x: (screenX - this.x) / this.scale,
      y: (screenY - this.y) / this.scale
    };
  }
}
