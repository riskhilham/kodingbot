import { LEVELS } from '../src/levels/levelData.js';

for (const lvl of LEVELS) {
  console.log(`Level ${lvl.id}: "${lvl.title}" | World: ${lvl.world} | Par: ${lvl.parCards}`);
  console.log(`  Start: (${lvl.startPos.x}, ${lvl.startPos.y}) dir: ${lvl.startPos.dir} | Finish: (${lvl.finishPos.x}, ${lvl.finishPos.y})`);
  console.log(`  Crystals: ${lvl.crystals ? lvl.crystals.map(c => `(${c.x},${c.y})`).join(', ') : 'none'}`);
  console.log(`  Switches: ${lvl.switches ? lvl.switches.map(s => `(${s.x},${s.y})`).join(', ') : 'none'}`);
  console.log(`  Available: ${lvl.availableCards.join(', ')}`);
  console.log(`  Hint: ${lvl.hint}`);
  console.log('---');
}

