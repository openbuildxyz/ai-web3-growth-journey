import { Room } from '../core/types';
import { AssetLoader } from '../assets/AssetLoader';

export function drawRoom(ctx: CanvasRenderingContext2D, room: Room, assets?: AssetLoader) {
  ctx.save();
  
  // Try to use Map Tiles for Floor
  const mapTiles = assets?.getImage('map_tiles');
  
  if (mapTiles) {
    ctx.save();
    // Create a pattern or draw tiles
    // Let's draw a nice tiled floor. Assuming 16x16 tiles.
    // Tile coords (arbitrary guess: 16, 64 - often floor tiles in sets)
    // We will just draw a 16x16 tile repeatedly
    
    // Clip to room area
    ctx.beginPath();
    ctx.rect(room.position.x, room.position.y, room.size.width, room.size.height);
    ctx.clip();
    
    ctx.imageSmoothingEnabled = false;
    
    const tileSize = 32; // Scale up 16x16 to 32x32 for better visibility
    const cols = Math.ceil(room.size.width / tileSize);
    const rows = Math.ceil(room.size.height / tileSize);
    
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        ctx.drawImage(
          mapTiles,
          16, 64, 16, 16, // Source: Hardcoded guess at a floor tile
          room.position.x + c * tileSize, room.position.y + r * tileSize, tileSize, tileSize
        );
      }
    }
    
    // Add "Walls" (Top edge)
    // ... logic for walls ...
    
    ctx.restore();
    
    // Overlay color for tint
    ctx.fillStyle = room.color; // tint
    ctx.fillRect(room.position.x, room.position.y, room.size.width, room.size.height);

  } else {
    // Fallback Glassmorphism Body
    ctx.fillStyle = room.color; // Should be rgba(..., 0.1)
    ctx.fillRect(room.position.x, room.position.y, room.size.width, room.size.height);
  }
  
  // Glowing Border
  ctx.strokeStyle = room.color.replace('0.1', '0.5'); // Hacky brightness boost
  ctx.lineWidth = 1;
  ctx.shadowColor = room.color;
  ctx.shadowBlur = 10;
  ctx.strokeRect(room.position.x, room.position.y, room.size.width, room.size.height);

  // Corner Accents (Cyber look)
  const cornerSize = 10;
  ctx.beginPath();
  // Top Left
  ctx.moveTo(room.position.x, room.position.y + cornerSize);
  ctx.lineTo(room.position.x, room.position.y);
  ctx.lineTo(room.position.x + cornerSize, room.position.y);
  // Bottom Right
  const right = room.position.x + room.size.width;
  const bottom = room.position.y + room.size.height;
  ctx.moveTo(right, bottom - cornerSize);
  ctx.lineTo(right, bottom);
  ctx.lineTo(right - cornerSize, bottom);
  
  ctx.stroke();

  // Label with Background
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
  ctx.fillRect(room.position.x, room.position.y, 100, 24); // Title bar background
  
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '600 12px "Inter", sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(room.name, room.position.x + 8, room.position.y + 12);

  ctx.restore();
}
