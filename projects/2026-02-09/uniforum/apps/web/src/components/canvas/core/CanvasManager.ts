import { Agent, InteractionEvent } from './types';
import { drawAgent } from '../renderers/drawAgent';
import { drawGrid } from '../renderers/drawGrid';
import { Camera } from './Camera';
import { AssetLoader } from '../assets/AssetLoader';
import { MATRIX, TILE_SIZE, MAP_DIMENSIONS, COLS, ROWS } from '../assets/mapData';

export class CanvasManager {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animationFrameId: number | null = null;
  
  // State
  private agents: Agent[] = [];
  
  // Systems
  public camera: Camera;
  private assets: AssetLoader;
  private onInteraction?: (event: InteractionEvent) => void;
  private onAgentUpdate?: (agents: Agent[]) => void;

  private lastTime: number = 0;
  private totalTime: number = 0; // For animations

  constructor(canvas: HTMLCanvasElement, onInteraction?: (event: InteractionEvent) => void, onAgentUpdate?: (agents: Agent[]) => void) {
    this.canvas = canvas;
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) throw new Error('Could not get 2d context');
    this.ctx = context;
    this.onInteraction = onInteraction;
    this.onAgentUpdate = onAgentUpdate;
    
    this.camera = new Camera();
    this.assets = new AssetLoader();
    
    // Initial centering (approx)
    this.camera.x = canvas.width / 2;
    this.camera.y = canvas.height / 2;

    this.setupInteractions();
  }



  public setAgents(agents: Agent[]) {
    this.agents = agents;
  }

  public resize(width: number, height: number) {
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    this.ctx.scale(dpr, dpr);

    // Recenter camera
    this.camera.x = width / 2;
    this.camera.y = height / 2;
  }

  public start() {
    if (this.animationFrameId !== null) return;
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  public stop() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  public destroy() {
    this.stop();
  }

  private loop = (time: number) => {
    const deltaTime = (time - this.lastTime) / 1000;
    this.lastTime = time;
    this.totalTime += deltaTime;

    this.update(deltaTime);
    this.draw();

    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  private update(deltaTime: number) {
    // Agent Movement Logic - only update position, not status
    // Status is controlled by React's forum-aware clustering logic
    this.agents.forEach(agent => {
      // Path Following (position only, don't change status)
      if (agent.path && agent.path.length > 0) {
        const nextNode = agent.path[0];
        const speed = 60.0;
        
        const dx = nextNode.x - agent.position.x;
        const dy = nextNode.y - agent.position.y;
        const dist = Math.hypot(dx, dy);
        
        if (dist > 1) {
          agent.position.x += (dx / dist) * speed * deltaTime;
          agent.position.y += (dy / dist) * speed * deltaTime;
          
          if (Math.abs(dx) > Math.abs(dy)) {
            agent.direction = dx > 0 ? 'right' : 'left';
          }
          // Note: Don't change status here - it's managed by React
        } else {
          agent.position.x = nextNode.x;
          agent.position.y = nextNode.y;
          agent.path.shift();
        }
      }
      
      if ((!agent.path || agent.path.length === 0) && agent.targetPosition) {
          agent.targetPosition = undefined;
      }
    });

    // 2. Proximity Detection for visual feedback
    // Note: Forum-based status (discussing/idle) and messages are now managed by React
    // based on the forum API. CanvasManager only handles visual rendering.
  }

  private draw() {
    const { width, height } = this.canvas;
    
    // 1. Clear - Background Color
    this.ctx.save();
    this.ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform for clear
    this.ctx.fillStyle = '#0f172a'; // Deep slate
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.restore();

    this.ctx.save();
    
    // 2. Apply Camera
    const dpr = window.devicePixelRatio || 1;
    // Note: ctx.scale(dpr, dpr) was handled in resize, but explicit transforms reset it sometimes
    // Simpler approach: Camera handles all world transforms
    this.camera.transform(this.ctx);

    // 3. Draw Background Map
    const mapBg = this.assets.getImage('map_bg');
    if (mapBg) {
      // Draw centered at 0,0
      const x = -mapBg.width / 2;
      const y = -mapBg.height / 2;
      this.ctx.drawImage(mapBg, x, y);
    } else {
      // Fallback to Grid if map not loaded yet
      drawGrid(this.ctx, { 
        width: width / dpr, 
        height: height / dpr, 
        backgroundColor: '', 
        gridColor: 'rgba(56, 189, 248, 0.1)' 
      }, this.camera.x, this.camera.y, this.camera.scale);
    }

    // 3.5 Draw Debug Map Tiles (Overlay)
    // this.drawDebugMap();

    // 4. Draw Agents
    this.agents.forEach(agent => drawAgent(this.ctx, agent, this.assets, this.totalTime));

    this.ctx.restore();
  }

  private setupInteractions() {
    // Mouse DOWN/MOVE/UP handled in React component? 
    // Or we bind them here. CanvasManager owning interaction is cleaner.
    
    // But Zoom/Pan logic often fits better in React due to specialized hooks, 
    // OR we do standard event listeners here. Let's do listeners here.
  }

  // Exposed for the React component to call on events
  public handleMouseDown(_x: number, _y: number) {
      // Pan start logic could go here if managed internally
  }

  public handleInteractionRaw(clientX: number, clientY: number, type: 'click' | 'hover') {
      const rect = this.canvas.getBoundingClientRect();
      const screenX = clientX - rect.left;
      const screenY = clientY - rect.top;
      
      const worldPos = this.camera.screenToWorld(screenX, screenY);
      
      this.handleHitTest(worldPos.x, worldPos.y, type);
  }

  private handleHitTest(worldX: number, worldY: number, type: 'click' | 'hover') {
    // Check Agents
    for (let i = this.agents.length - 1; i >= 0; i--) {
      const agent = this.agents[i];
      const dx = worldX - agent.position.x;
      const dy = worldY - agent.position.y;
      if (dx * dx + dy * dy <= 225) { // 15 radius
        this.onInteraction?.({ type, x: worldX, y: worldY, target: { type: 'agent', id: agent.id } });
        this.canvas.style.cursor = 'pointer';
        return;
      }
    }
    
    // Check Rooms...
    this.canvas.style.cursor = 'grab'; // Default pan cursor
  }

  private drawDebugMap() {
    const startX = -MAP_DIMENSIONS.width / 2;
    const startY = -MAP_DIMENSIONS.height / 2;

    this.ctx.globalAlpha = 0.5; // More visible
    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)'; // Make borders very clear

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const value = MATRIX[r][c];
        const x = startX + c * TILE_SIZE;
        const y = startY + r * TILE_SIZE;

        if (value === 0) {
          // Walkable - Green
          this.ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
        } else {
          // Blocked - Red
          this.ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
        }

        this.ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        this.ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
      }
    }
    this.ctx.globalAlpha = 1.0; // Reset
  }
}
