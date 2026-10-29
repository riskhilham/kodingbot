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

// Function to find how many root cards can be achieved with loop compression
function compressWithLoops(actions) {
  // Simple run-length compression of repeating sub-patterns
  // If pattern repeats >= 2 times, it can be 1 loop block (1 root card)
  // Let's do a dynamic programming to find minimal root cards
  const n = actions.length;
  const dp = new Array(n + 1).fill(Infinity);
  dp[0] = 0;

  for (let i = 0; i < n; i++) {
    // 1 normal card
    dp[i + 1] = Math.min(dp[i + 1], dp[i] + 1);

    // Try repeating patterns of length L from i
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
        // We can loop this pattern of length L, k times!
        // A loop block counts as 1 root card!
        for (let count = 2; count <= k; count++) {
          dp[i + count * L] = Math.min(dp[i + count * L], dp[i] + 1);
        }
      }
    }
  }
  return dp[n];
}

console.log("LEVEL AUDIT REPORT:");
console.log("------------------------------------------------------------------------------------------------------------------------");
console.log(
  "Lvl".padEnd(4) +
  "Title".padEnd(28) +
  "HasLoop".padEnd(9) +
  "MinRaw".padEnd(8) +
  "MinLoop".padEnd(9) +
  "ParCards".padEnd(10) +
  "RawDiff".padEnd(9) +
  "LoopDiff".padEnd(10) +
  "Status"
);
console.log("------------------------------------------------------------------------------------------------------------------------");

for (const level of LEVELS) {
  const sol = solveLevel(level);
  if (!sol) {
    console.log(`L${level.id}`.padEnd(4) + level.title.padEnd(28) + " NO SOLUTION!");
    continue;
  }
  const hasLoop = level.availableCards.includes(C.LOOP);
  const minRaw = sol.length;
  const minLoop = compressWithLoops(sol);
  const par = level.parCards;
  const rawDiff = minRaw - par;
  const loopDiff = minLoop - par;

  let status = "OK";
  if (!hasLoop) {
    if (minRaw > par) {
      status = `BROKEN: Impossible (needs ${minRaw}, par=${par})`;
    } else if (par > minRaw + 2) {
      status = `GENEROUS (par=${par}, min=${minRaw})`;
    }
  } else {
    if (minLoop > par) {
      status = `BROKEN: Impossible even with loop (needs ${minLoop}, par=${par})`;
    } else if (minRaw <= par) {
      status = `EASY: Achievable without loop (raw=${minRaw} <= par=${par})`;
    } else {
      status = `LOOP_REQUIRED (raw=${minRaw} > par=${par}, loop=${minLoop})`;
    }
  }

  console.log(
    `L${level.id}`.padEnd(4) +
    level.title.slice(0, 26).padEnd(28) +
    (hasLoop ? "YES" : "NO").padEnd(9) +
    String(minRaw).padEnd(8) +
    String(minLoop).padEnd(9) +
    String(par).padEnd(10) +
    (rawDiff > 0 ? `+${rawDiff}` : String(rawDiff)).padEnd(9) +
    (loopDiff > 0 ? `+${loopDiff}` : String(loopDiff)).padEnd(10) +
    status
  );
}

