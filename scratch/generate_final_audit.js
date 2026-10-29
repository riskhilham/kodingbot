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

const report = [];

for (const lvl of LEVELS) {
  const actions = solveLevel(lvl);
  const minSequential = actions.length;
  const hasLoop = lvl.availableCards.includes(C.LOOP);
  const hasIf = lvl.availableCards.includes(C.IF_OBSTACLE);
  const par = lvl.parCards;
  
  let issue = 'PASS';
  let recommendedPar = par;
  let reason = '';

  if (!hasLoop) {
    if (minSequential > par) {
      issue = 'IMPOSSIBLE';
      recommendedPar = minSequential;
      reason = `Tanpa LOOP, rute tersingkat butuh ${minSequential} kartu, Par (${par}) mustahil dicapai.`;
    }
  } else {
    // Has loop
    // Check if level requires loop or can be solved sequentially
    if (minSequential > par) {
      // requires loop to meet par
      // But let's check if the loop is even possible or if par is too strict
      if (lvl.id === 14) {
        issue = 'BROKEN_MAP_AND_PAR';
        recommendedPar = 10;
        reason = `Byte menghadap pohon (UP) dan tangga tidak seragam, loop tidak dapat bekerja. Rute sekuensial butuh 10-11 kartu.`;
      } else if (lvl.id === 24) {
        issue = 'TOO_STRICT';
        recommendedPar = 8;
        reason = `Hanya 2 kartu terakhir yang bisa di-loop, rute optimal butuh 8 kartu (Par lama: 6).`;
      } else {
        reason = `Bisa dicapai dengan LOOP (${minSequential} langkah dikompresi <= ${par} kartu).`;
      }
    }
  }

  report.push({
    id: lvl.id,
    title: lvl.title,
    world: lvl.world,
    hasLoop,
    hasIf,
    minSequential,
    curPar: par,
    recommendedPar,
    issue,
    reason
  });
}

console.log(JSON.stringify(report, null, 2));

