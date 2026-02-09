export interface CanvasConfig {
  width: number;
  height: number;
  backgroundColor: string;
  gridColor: string;
}

export const drawGrid = (
  ctx: CanvasRenderingContext2D, 
  config: CanvasConfig, 
  cameraX: number, 
  cameraY: number, 
  scale: number
) => {
  const gridSize = 50; // World units
  const width = config.width;
  const height = config.height;

  // Calculate visible range based on camera
  // We strictly draw enough lines to cover the visible viewport
  const startX = Math.floor((-cameraX) / (gridSize * scale)) * gridSize;
  const startY = Math.floor((-cameraY) / (gridSize * scale)) * gridSize;
  
  // Extra buffer to ensure we cover screen edges
  const endX = startX + (width / scale) + gridSize * 2;
  const endY = startY + (height / scale) + gridSize * 2;

  ctx.save();
  ctx.strokeStyle = config.gridColor;
  ctx.lineWidth = 1 / scale; // Keep line width constant on screen

  ctx.beginPath();

  // Vertical Lines
  for (let x = startX; x <= endX; x += gridSize) {
    ctx.moveTo(x, startY);
    ctx.lineTo(x, endY);
  }

  // Horizontal Lines
  for (let y = startY; y <= endY; y += gridSize) {
    ctx.moveTo(startX, y);
    ctx.lineTo(endX, y);
  }

  ctx.stroke();

  // "Cyber" Intersections (Optional Glow)
  // Only draw a few for performance/effect, or modulate opacity
  ctx.restore();
};
