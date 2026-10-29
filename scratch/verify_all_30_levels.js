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

function compressWithLoops(actions) {
  const n = actions.length;
  const dp = new Array(n + 1).fill(Infinity);
  dp[0] = 0;

  for (let i = 0; i < n; i++) {
    dp[i + 1] = Math.min(dp[i + 1], dp[i] + 1);

    for (let L = 1; L <= 4; L++) {
      let k = 1;
      while (i + (k + 1) * L <= n) {
        let matches = true;
        for (let j = 0; j < L; j++) {
          if (actions[i + k * L + j] !== actions[i + j]) {
            matches = false;
            break;
          }
        }
        if (!matches) break;
        k++;
      }
      if (k >= 2) {
        for (let count = 2; count <= k; count++) {
          dp[i + count * L] = Math.min(dp[i + count * L], dp[i] + 1);
        }
      }
    }
  }
  return dp[n];
}

console.log('RUNNING COMPREHENSIVE 30-LEVEL 3-STAR VICTORY VERIFICATION:');
console.log('='.repeat(90));

let passCount = 0;
let failCount = 0;

for (const level of LEVELS) {
  const actions = solveLevel(level);
  if (!actions) {
    console.error(`[FAIL] Level ${level.id} (${level.title}): No path found!`);
    failCount++;
    continue;
  }

  const rawCards = actions.length;
  const hasLoop = level.availableCards.includes(C.LOOP);
  const cardsUsed = hasLoop ? Math.min(rawCards, compressWithLoops(actions)) : rawCards;
  const par = level.parCards;

  const star1 = true;
  const star2 = true; // All crystals collected verified by solver
  const star3 = cardsUsed <= par;
  const totalStars = 1 + (star2 ? 1 : 0) + (star3 ? 1 : 0);

  if (totalStars === 3) {
    passCount++;
    console.log(`[PASS] Level ${String(level.id).padStart(2)}: "${level.title.padEnd(26)}" -> ${totalStars} Bintang (Cards: ${cardsUsed}, Par: ${par})`);
  } else {
    failCount++;
    console.error(`[FAIL] Level ${String(level.id).padStart(2)}: "${level.title.padEnd(26)}" -> ONLY ${totalStars} Bintang! (Cards: ${cardsUsed}, Par: ${par})`);
  }
}

console.log('='.repeat(90));
console.log(`RESULTS: ${passCount} / ${LEVELS.length} Levels PASSED 3 Bintang Perfectly! (Failures: ${failCount})`);
if (failCount === 0) {
  console.log('SUCCESS! ALL 30 LEVELS ARE 100% 3-STAR ACHIEVABLE!');
  process.exit(0);
} else {
  process.exit(1);
}

