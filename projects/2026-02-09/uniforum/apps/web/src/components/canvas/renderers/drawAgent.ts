import { Agent } from '../core/types';
import { AssetLoader } from '../assets/AssetLoader';

export function drawAgent(
  ctx: CanvasRenderingContext2D, 
  agent: Agent, 
  assets: AssetLoader,
  time: number
) {
  ctx.save();
  
  const x = agent.position.x;
  const y = agent.position.y;

  // Determine Sprite Key (hash name for consistency with UI)
  const hash = agent.name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const charIndex = (Math.abs(hash) % 32) + 1; // 1-32 range
  
  const sprite = assets.getImage(`agent_${charIndex}`);

  if (sprite) {
    // Sprite Rendering
    ctx.imageSmoothingEnabled = false; // Pixel art style
    
    // Frame Config (assuming 32x32 frames, 4 rows: Down, Left, Right, Up)
    // 32x32 per frame.
    const frameSize = 32;
    
    // Determine Row based on Direction
    let row = 0; // Down
    if (agent.direction === 'left') row = 1;
    if (agent.direction === 'right') row = 2;
    if (agent.direction === 'right' && agent.targetPosition?.y && agent.targetPosition.y < y) row = 3; // Up (Optional logic)
    
    // Animation Frame (3 frames per row usually)
    const totalFrames = 3; 
    const isMoving = agent.status === 'moving';
    const animationFrame = isMoving ? Math.floor((time * 8) % totalFrames) : 1; // 1 is usually standing

    // Draw
    ctx.drawImage(
      sprite,
      animationFrame * frameSize, row * frameSize, frameSize, frameSize, // Source
      x - 16, y - 24, 32, 32 // Destination (Centered-ish)
    );
  } else {
    // Fallback: Procedural Drawing
    
    // Body
    ctx.fillStyle = agent.color;
    ctx.beginPath();
    ctx.arc(x, y, 12, 0, Math.PI * 2);
    ctx.fill();
    
    // "Eye" (Directional)
    const eyeOffset = agent.direction === 'left' ? -4 : 4;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(x + eyeOffset, y - 2, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Visual pulse for "Thinking" / "Discussing"
  if (agent.status === 'discussing') {
    const pulse = Math.sin(time * 5) * 5;
    ctx.shadowColor = agent.color;
    ctx.shadowBlur = 15 + pulse;
  }
  
  // Chat Bubble (when discussing and has message)
  if ((agent.status === 'discussing' || agent.status === 'speaking') && agent.lastMessage) {
    ctx.save();
    
    const bubbleY = y - 50;
    const text = agent.lastMessage;
    ctx.font = '9px "Inter", sans-serif';
    const textWidth = ctx.measureText(text).width;
    const bubbleWidth = Math.min(textWidth + 16, 120);
    const bubbleHeight = 24;
    const bubbleX = x - bubbleWidth / 2;
    
    // Bubble Background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 1;
    
    // Rounded Rectangle
    ctx.beginPath();
    ctx.roundRect(bubbleX, bubbleY - bubbleHeight, bubbleWidth, bubbleHeight, 6);
    ctx.fill();
    ctx.stroke();
    
    // Tail/Arrow
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.beginPath();
    ctx.moveTo(x - 5, bubbleY);
    ctx.lineTo(x, bubbleY + 8);
    ctx.lineTo(x + 5, bubbleY);
    ctx.closePath();
    ctx.fill();
    
    // Text (truncate if too long)
    ctx.fillStyle = '#1e293b';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const displayText = text.length > 20 ? text.substring(0, 18) + '...' : text;
    ctx.fillText(displayText, x, bubbleY - bubbleHeight / 2);
    
    ctx.restore();
  }

  // Label
  ctx.restore(); // Drop shadow off for text
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.font = '10px "Inter", sans-serif'; 
  ctx.textAlign = 'center';
  ctx.fillText(agent.name, x, y + 24);
}
