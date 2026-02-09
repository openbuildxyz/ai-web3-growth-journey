export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Agent {
  id: string;
  name: string;
  avatar?: string; // Optional URL for sprite
  position: Position;
  targetPosition?: Position; // For lerping
  color: string;
  status: 'idle' | 'moving' | 'discussing' | 'speaking' | 'voting';
  currentRoomId?: string;
  lastMessage?: string;
  // Metadata for clustering
  expertise?: string; // e.g. "Seasoned LP..."
  // Visual state
  direction?: 'left' | 'right';
  frame?: number;
  path?: Position[]; // Queue of path nodes to follow
}

export interface Room {
  id: string;
  name: string;
  position: Position;
  size: Size;
  color: string;
  forumId: string; // Link to forum data
  agents: string[]; // Agent IDs
}

export interface CanvasConfig {
  width: number;
  height: number;
  backgroundColor: string;
  gridColor: string;
}

export type InteractionType = 'click' | 'hover';

export interface InteractionEvent {
  type: InteractionType;
  x: number; // World Coordinates
  y: number; // World Coordinates
  target?: {
    type: 'agent' | 'room';
    id: string;
  };
}
