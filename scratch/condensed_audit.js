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
  
  const startState = {
    x: level.startPos.x,
    y: level.startPos.y,
    dir: level.startPos.dir,
    cMask: 0,
    sMask: 0,
    actions: []
  };
  
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
      for (let i = 0; i < numSwitches; i++) {
        if ((sMask & (1 << i)) && level.switches[i].bridgeX === x && level.switches[i].bridgeY === y) {
          return true;
        }
      }
      return false;
    }
    return false;
  }

  let bestSolution = null;

  while (queue.length > 0) {
    const cur = queue.shift();
    const key = `${cur.x},${cur.y},${cur.dir},${cur.cMask},${cur.sMask}`;
    if (visited.has(key)) continue;
    visited.add(key);

    if (cur.x === level.finishPos.x && cur.y === level.finishPos.y) {
      if (cur.cMask === (1 << numCrystals) - 1) {
        bestSolution = cur.actions;
        break;
      }
    }

    if (level.availableCards.includes(C.TURN_LEFT)) {
      const nextDir = (cur.dir + 3) % 4;
      queue.push({
        x: cur.x, y: cur.y, dir: nextDir,
        cMask: cur.cMask, sMask: cur.sMask,
        actions: [...cur.actions, C.TURN_LEFT]
      });
    }

    if (level.availableCards.includes(C.TURN_RIGHT)) {
      const nextDir = (cur.dir + 1) % 4;
      queue.push({
        x: cur.x, y: cur.y, dir: nextDir,
        cMask: cur.cMask, sMask: cur.sMask,
        actions: [...cur.actions, C.TURN_RIGHT]
      });
    }

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

for (const lvl of LEVELS) {
  const actions = solveLevel(lvl);
  console.log(`\n------------------------------------------------------------`);
  console.log(`Level ${lvl.id}: ${lvl.title} (${lvl.world})`);
  console.log(`Available: [${lvl.availableCards.join(', ')}] | Par: ${lvl.parCards}`);
  console.log(`Optimal actions (${actions.length}): ${actions.join(' ')}`);
  
  // Group consecutive forwards/jumps
  const rle = [];
  let curCmd = actions[0];
  let curCount = 0;
  for (const a of actions) {
    if (a === curCmd) curCount++;
    else {
      rle.push(curCount > 1 ? `${curCmd}x${curCount}` : curCmd);
      curCmd = a;
      curCount = 1;
    }
  }
  if (curCount > 0) rle.push(curCount > 1 ? `${curCmd}x${curCount}` : curCmd);
  console.log(`Condensed: ${rle.join(' -> ')}`);
}

