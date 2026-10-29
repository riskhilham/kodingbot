import { LEVELS } from '../src/levels/levelData.js';
import { CONFIG } from '../src/config.js';

// Let's test all possible permutations of crystal orders for Level 6
const lvl6 = LEVELS.find(l => l.id === 6);
console.log('Level 6 layout:');
for (let y = 0; y < lvl6.layout.length; y++) {
  console.log(lvl6.layout[y].map((v, x) => {
    if (x === lvl6.startPos.x && y === lvl6.startPos.y) return 'B';
    if (x === lvl6.finishPos.x && y === lvl6.finishPos.y) return 'F';
    if (lvl6.crystals.some(c => c.x === x && c.y === y)) return '*';
    return v === 1 ? '#' : (v === 2 ? '.' : v);
  }).join(' '));
}

