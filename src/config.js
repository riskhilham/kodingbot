/**
 * KodingBot: Petualangan Pulau Algoritma
 * Global Configuration & Game Constants
 */

export const CONFIG = {
  // Virtual Canvas Resolution (Internal rendering grid)
  CANVAS_WIDTH: 960,
  CANVAS_HEIGHT: 640,
  
  // Grid properties
  TILE_SIZE: 72,
  GRID_OFFSET_X: 40,
  GRID_OFFSET_Y: 40,
  
  // Execution Speeds (in ms)
  STEP_DURATION: 420,
  JUMP_DURATION: 480,
  
  // Directions (Clockwise: 0: Up/North, 1: Right/East, 2: Down/South, 3: Left/West)
  DIRECTIONS: {
    UP: 0,
    RIGHT: 1,
    DOWN: 2,
    LEFT: 3
  },
  
  // Direction vectors (dx, dy)
  DIR_VECTORS: [
    { dx: 0, dy: -1, name: 'Atas' },   // 0: Up
    { dx: 1, dy: 0, name: 'Kanan' },   // 1: Right
    { dx: 0, dy: 1, name: 'Bawah' },   // 2: Down
    { dx: -1, dy: 0, name: 'Kiri' }    // 3: Left
  ],
  
  // Tile Types
  TILE_TYPES: {
    EMPTY: 0,
    PATH: 1,
    GRASS: 2,
    WATER: 3,
    HAZARD: 4,
    SWITCH: 5,
    BRIDGE_OFF: 6,
    BRIDGE_ON: 7,
    FINISH: 8
  },
  
  // Command Types
  COMMANDS: {
    FORWARD: 'FORWARD',
    TURN_RIGHT: 'TURN_RIGHT',
    TURN_LEFT: 'TURN_LEFT',
    JUMP: 'JUMP',
    LOOP: 'LOOP',
    IF_OBSTACLE: 'IF_OBSTACLE'
  },
  
  // Colors (from ART_DIRECTION.md)
  COLORS: {
    EMERALD: '#10B981',
    CYAN: '#06B6D4',
    NEON_BLUE: '#22D3EE',
    AMBER: '#F59E0B',
    PURPLE: '#8B5CF6',
    ROSE: '#F43F5E',
    SLATE: '#334155',
    DARK_BG: '#0F172A',
    WHITE: '#F8FAFC'
  }
};
