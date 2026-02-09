
export const MAP_DIMENSIONS = {
  width: 928,
  height: 640,
};

export const TILE_SIZE = 32;
export const COLS = 29; // 928 / 32
export const ROWS = 20; // 640 / 32

// 1 = Blocked (no entry), 0 = Walkable (can walk)
// Generated from map analysis (City Map)
export const MATRIX: number[][] = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,1,1,1,1,1,1,1,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,1,1,1,1,1,1,1,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,1,1,1,1,1,1,1,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,0,0,1,1,1,0,0,0,0,1],
  [1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,1,1,0,0,0,0,1],
  [1,1,1,1,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,1,1,1,0,1,0,1],
  [1,1,1,1,0,0,0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

export const isWalkable = (x: number, y: number): boolean => {
  const gridX = Math.floor((x + MAP_DIMENSIONS.width / 2) / TILE_SIZE);
  const gridY = Math.floor((y + MAP_DIMENSIONS.height / 2) / TILE_SIZE);

  if (gridY >= 0 && gridY < ROWS && gridX >= 0 && gridX < COLS) {
    return MATRIX[gridY][gridX] === 0;
  }
  return false;
};

// A* Pathfinding
interface Point { x: number; y: number; }
interface Node { x: number; y: number; parent?: Node; g: number; h: number; f: number; }

export const findPath = (start: Point, end: Point): Point[] => {
  const startGrid = {
    x: Math.floor((start.x + MAP_DIMENSIONS.width / 2) / TILE_SIZE),
    y: Math.floor((start.y + MAP_DIMENSIONS.height / 2) / TILE_SIZE)
  };
  const endGrid = {
    x: Math.floor((end.x + MAP_DIMENSIONS.width / 2) / TILE_SIZE),
    y: Math.floor((end.y + MAP_DIMENSIONS.height / 2) / TILE_SIZE)
  };

  // Clamp to Grid
  startGrid.x = Math.max(0, Math.min(startGrid.x, COLS - 1));
  startGrid.y = Math.max(0, Math.min(startGrid.y, ROWS - 1));
  endGrid.x = Math.max(0, Math.min(endGrid.x, COLS - 1));
  endGrid.y = Math.max(0, Math.min(endGrid.y, ROWS - 1));

  if (MATRIX[endGrid.y][endGrid.x] === 1) return [];

  const openList: Node[] = [];
  const closedList: boolean[][] = Array(ROWS).fill(false).map(() => Array(COLS).fill(false));

  openList.push({ x: startGrid.x, y: startGrid.y, g: 0, h: 0, f: 0 });

  while (openList.length > 0) {
    openList.sort((a, b) => a.f - b.f);
    const current = openList.shift()!;

    if (current.x === endGrid.x && current.y === endGrid.y) {
      const path: Point[] = [];
      let curr: Node | undefined = current;
      while (curr) {
        path.push({
          x: (curr.x * TILE_SIZE) - (MAP_DIMENSIONS.width / 2) + (TILE_SIZE / 2),
          y: (curr.y * TILE_SIZE) - (MAP_DIMENSIONS.height / 2) + (TILE_SIZE / 2)
        });
        curr = curr.parent;
      }
      return path.reverse();
    }

    closedList[current.y][current.x] = true;

    const neighbors = [{ x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }];

    for (const offset of neighbors) {
      const nx = current.x + offset.x;
      const ny = current.y + offset.y;

      if (nx >= 0 && nx < COLS && ny >= 0 && ny < ROWS) {
        if (MATRIX[ny][nx] === 0 && !closedList[ny][nx]) {
          const g = current.g + 1;
          const h = Math.abs(nx - endGrid.x) + Math.abs(ny - endGrid.y);
          const f = g + h;

          const existing = openList.find(n => n.x === nx && n.y === ny);
          if (existing) {
            if (g < existing.g) {
              existing.g = g;
              existing.f = f;
              existing.parent = current;
            }
          } else {
            openList.push({ x: nx, y: ny, parent: current, g, h, f });
          }
        }
      }
    }
  }

  return [];
};

export const getRandomWalkablePosition = () => {
  const validTiles: { c: number; r: number }[] = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (MATRIX[r][c] === 0) {
        validTiles.push({ c, r });
      }
    }
  }

  if (validTiles.length === 0) return { x: 0, y: 0 };

  const tile = validTiles[Math.floor(Math.random() * validTiles.length)];
  const worldX = (tile.c * TILE_SIZE) - (MAP_DIMENSIONS.width / 2) + (TILE_SIZE / 2);
  const worldY = (tile.r * TILE_SIZE) - (MAP_DIMENSIONS.height / 2) + (TILE_SIZE / 2);

  return { x: worldX, y: worldY };
};

export const getNearestWalkablePosition = (x: number, y: number): { x: number, y: number } => {
  // Convert world coordinates to grid coordinates
  const gridX = Math.floor((x + MAP_DIMENSIONS.width / 2) / TILE_SIZE);
  const gridY = Math.floor((y + MAP_DIMENSIONS.height / 2) / TILE_SIZE);

  // Spiral search for nearest walkable tile
  // Start with radius 0 (center) and expand
  for (let r = 0; r < 10; r++) { // limit search radius
      for (let dx = -r; dx <= r; dx++) {
          for (let dy = -r; dy <= r; dy++) {
               // Only check the perimeter of the current radius to avoid duplicates
               if (Math.abs(dx) !== r && Math.abs(dy) !== r) continue;

               const checkX = gridX + dx;
               const checkY = gridY + dy;

               if (checkX >= 0 && checkX < COLS && checkY >= 0 && checkY < ROWS) {
                   if (MATRIX[checkY][checkX] === 0) {
                       // Found walkable tile! Convert back to world coordinates
                       return {
                           x: (checkX * TILE_SIZE) - (MAP_DIMENSIONS.width / 2) + (TILE_SIZE / 2),
                           y: (checkY * TILE_SIZE) - (MAP_DIMENSIONS.height / 2) + (TILE_SIZE / 2)
                       };
                   }
               }
          }
      }
  }

  // Fallback if no nearby tile found (shouldn't happen often if map is good)
  return getRandomWalkablePosition();
};
