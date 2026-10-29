import { LEVELS } from '../src/levels/levelData.js';
import { CONFIG } from '../src/config.js';

const C = CONFIG.COMMANDS;
const D = CONFIG.DIRECTIONS;
const V = CONFIG.DIR_VECTORS;
const T = CONFIG.TILE_TYPES;

function solveLevel(level) {
  const W = level.layout[0].length;
  const H = level.layout.length;
  const numCrystals = level.crystals ? level.crystals.length : 0;
  const numSwitches = level.switches ? level.switches.length : 0;
  
  // State: x, y, dir, crystalMask, switchMask
  // BFS queue
  const startState = {
    x: level.startPos.x,
    y: level.startPos.y,
    dir: level.startPos.dir,
    cMask: 0,
    sMask: 0,
    actions: []
  };
  
  // Check initial tile for crystals/switches
  for (let i = 0; i < numCrystals; i++) {
    if (level.crystals[i].x === startState.x && level.crystals[i].y === startState.y) {
      startState.cMask |= (1 << i);
    }
  }
  for (let i = 0; i < numSwitches; i++) {
    if (level.switches[i].x === startState.x && level.switches[i].y === startState.y) {
      startState.sMask |= (1 << i);
    }
  }

  const visited = new Set();
  const queue = [startState];
  
  function isWalkable(x, y, sMask) {
    if (x < 0 || x >= W || y < 0 || y >= H) return false;
    const tile = level.layout[y][x];
    if (tile === T.PATH || tile === T.SWITCH || tile === T.FINISH) return true;
    if (tile === T.BRIDGE_ON) return true;
    if (tile === T.BRIDGE_OFF) {
      // Check if activated by switch
      for (let i = 0; i < numSwitches; i++) {
        if ((sMask & (1 << i)) && level.switches[i].bridgeX === x && level.switches[i].bridgeY === y) {
          return true;
        }
      }
      return false;
    }
    // Grass/Hazard/Water/Tree
    return false;
  }

  let bestSolution = null;

  while (queue.length > 0) {
    const cur = queue.shift();
    const key = `${cur.x},${cur.y},${cur.dir},${cur.cMask},${cur.sMask}`;
    if (visited.has(key)) continue;
    visited.add(key);

    // Check finish
    if (cur.x === level.finishPos.x && cur.y === level.finishPos.y) {
      // check all crystals collected
      if (cur.cMask === (1 << numCrystals) - 1) {
        bestSolution = cur.actions;
        break;
      }
    }

    // Try TURN_LEFT
    if (level.availableCards.includes(C.TURN_LEFT)) {
      const nextDir = (cur.dir + 3) % 4;
      queue.push({
        x: cur.x, y: cur.y, dir: nextDir,
        cMask: cur.cMask, sMask: cur.sMask,
        actions: [...cur.actions, C.TURN_LEFT]
      });
    }

    // Try TURN_RIGHT
    if (level.availableCards.includes(C.TURN_RIGHT)) {
      const nextDir = (cur.dir + 1) % 4;
      queue.push({
        x: cur.x, y: cur.y, dir: nextDir,
        cMask: cur.cMask, sMask: cur.sMask,
        actions: [...cur.actions, C.TURN_RIGHT]
      });
    }

    // Try FORWARD
    if (level.availableCards.includes(C.FORWARD)) {
      const nx = cur.x + V[cur.dir].dx;
      const ny = cur.y + V[cur.dir].dy;
      if (isWalkable(nx, ny, cur.sMask)) {
        let nCMask = cur.cMask;
        let nSMask = cur.sMask;
        for (let i = 0; i < numCrystals; i++) {
          if (level.crystals[i].x === nx && level.crystals[i].y === ny) {
            nCMask |= (1 << i);
          }
        }
        for (let i = 0; i < numSwitches; i++) {
          if (level.switches[i].x === nx && level.switches[i].y === ny) {
            nSMask |= (1 << i);
          }
        }
        queue.push({
          x: nx, y: ny, dir: cur.dir,
          cMask: nCMask, sMask: nSMask,
          actions: [...cur.actions, C.FORWARD]
        });
      }
    }

    // Try JUMP
    if (level.availableCards.includes(C.JUMP)) {
      const nx = cur.x + V[cur.dir].dx * 2;
      const ny = cur.y + V[cur.dir].dy * 2;
      if (isWalkable(nx, ny, cur.sMask)) {
        let nCMask = cur.cMask;
        let nSMask = cur.sMask;
        for (let i = 0; i < numCrystals; i++) {
          if (level.crystals[i].x === nx && level.crystals[i].y === ny) {
            nCMask |= (1 << i);
          }
        }
        for (let i = 0; i < numSwitches; i++) {
          if (level.switches[i].x === nx && level.switches[i].y === ny) {
            nSMask |= (1 << i);
          }
        }
        queue.push({
          x: nx, y: ny, dir: cur.dir,
          cMask: nCMask, sMask: nSMask,
          actions: [...cur.actions, C.JUMP]
        });
      }
    }
  }

  return bestSolution;
}

for (const level of LEVELS) {
  const sol = solveLevel(level);
  if (!sol) {
    console.log(`[FAIL] Level ${level.id} (${level.title}): NO SOLUTION FOUND!`);
  } else {
    const rawCount = sol.length;
    console.log(`Level ${level.id} (${level.title}): Raw cards = ${rawCount}, Par = ${level.parCards}, Diff = ${rawCount - level.parCards}`);
    console.log(`  Actions: ${sol.join(' ')}`);
  }
}

