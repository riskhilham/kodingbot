import { LEVELS } from '../src/levels/levelData.js';
import { CONFIG } from '../src/config.js';

console.log('Total levels:', LEVELS.length);

for (const level of LEVELS) {
  console.log(`\n========================================`);
  console.log(`Level ${level.id}: ${level.title} (${level.world})`);
  console.log(`Concept: ${level.concept}`);
  console.log(`ParCards: ${level.parCards}`);
  console.log(`Available Cards:`, level.availableCards);
  console.log(`Start: (${level.startPos.x}, ${level.startPos.y}) dir=${level.startPos.dir}`);
  console.log(`Finish: (${level.finishPos.x}, ${level.finishPos.y})`);
  console.log(`Crystals:`, level.crystals);
  console.log(`Switches:`, level.switches);
  
  // Print grid
  const H = level.layout.length;
  const W = level.layout[0].length;
  console.log(`Grid ${W}x${H}:`);
  for (let y = 0; y < H; y++) {
    let rowStr = '';
    for (let x = 0; x < W; x++) {
      let char = '.';
      const tile = level.layout[y][x];
      if (tile === 0) char = '~'; // water
      else if (tile === 1) char = '#'; // stone path
      else if (tile === 2) char = 'T'; // obstacle / tree
      else if (tile === 3) char = '_'; // bridge inactive
      else if (tile === 4) char = '='; // bridge active
      else if (tile === 5) char = 'S'; // switch
      else if (tile === 8) char = 'F'; // finish
      
      // Check overlay
      if (x === level.startPos.x && y === level.startPos.y) char = 'B';
      if (x === level.finishPos.x && y === level.finishPos.y) char = 'F';
      if (level.crystals && level.crystals.some(c => c.x === x && c.y === y)) char = '*';
      if (level.switches && level.switches.some(s => s.x === x && s.y === y)) char = 'S';
      rowStr += char + ' ';
    }
    console.log(`  ${y}: ${rowStr}`);
  }
}

