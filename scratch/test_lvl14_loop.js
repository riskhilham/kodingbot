import { LEVELS } from '../src/levels/levelData.js';
import { CONFIG } from '../src/config.js';

const lvl14 = JSON.parse(JSON.stringify(LEVELS.find(l => l.id === 14)));
console.log('Testing Level 14 variations:');

// Test with startPos dir = D.RIGHT
lvl14.startPos.dir = CONFIG.DIRECTIONS.RIGHT;

// Let's see if any program with <= 6 cards can solve it
// Possible cards: FORWARD, TURN_RIGHT, TURN_LEFT, LOOP
// Where LOOP body has up to 5 cards, count 2..5
// Let's write an interpreter to test programs
function simulate(cards, level) {
  let x = level.startPos.x;
  let y = level.startPos.y;
  let dir = level.startPos.dir;
  const V = CONFIG.DIR_VECTORS;
  const T = CONFIG.TILE_TYPES;
  let cMask = 0;
  const numCrystals = level.crystals.length;
  
  // Flatten
  const steps = [];
  for (const c of cards) {
    if (c.type === 'LOOP') {
      for (let k = 0; k < c.count; k++) {
        for (const b of c.body) steps.push(b);
      }
    } else {
      steps.push(c.type);
    }
  }

  for (const s of steps) {
    if (s === 'TURN_LEFT') dir = (dir + 3) % 4;
    else if (s === 'TURN_RIGHT') dir = (dir + 1) % 4;
    else if (s === 'FORWARD') {
      const nx = x + V[dir].dx;
      const ny = y + V[dir].dy;
      if (nx < 0 || nx >= level.gridWidth || ny < 0 || ny >= level.gridHeight) return false;
      const tile = level.layout[ny][nx];
      if (tile !== 1 && tile !== 8) return false;
      x = nx; y = ny;
      for (let i = 0; i < numCrystals; i++) {
        if (level.crystals[i].x === x && level.crystals[i].y === y) cMask |= (1 << i);
      }
      if (x === level.finishPos.x && y === level.finishPos.y && cMask === (1 << numCrystals) - 1) {
        return { success: true, stepsCount: steps.length };
      }
    }
  }
  return false;
}

// Let's check sequential
const seq = [
  { type: 'FORWARD' },
  { type: 'TURN_LEFT' },
  { type: 'FORWARD' },
  { type: 'TURN_RIGHT' },
  { type: 'FORWARD' },
  { type: 'FORWARD' },
  { type: 'TURN_LEFT' },
  { type: 'FORWARD' },
  { type: 'TURN_RIGHT' },
  { type: 'FORWARD' }
];
console.log('Sequential (10 cards) with dir=RIGHT:', simulate(seq, lvl14));

// Can we use loop?
// e.g. LOOP(2, [FORWARD, TURN_LEFT, FORWARD, TURN_RIGHT])?
// From (1,3):
// Iter 1: FORWARD (2,3), TURN_LEFT(UP), FORWARD (2,2), TURN_RIGHT(RIGHT) -> at (2,2)
// Iter 2: FORWARD (3,2), TURN_LEFT(UP) -> at (3,2) facing UP!
// Next step forward would be (3,1) which is a TREE (2)!
// It crashes into tree!
console.log('Testing Loop 2x [F, TL, F, TR]:', simulate([
  { type: 'LOOP', count: 2, body: ['FORWARD', 'TURN_LEFT', 'FORWARD', 'TURN_RIGHT'] }
], lvl14));

