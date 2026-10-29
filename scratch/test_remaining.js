import { LEVELS } from '../src/levels/levelData.js';
import { CONFIG } from '../src/config.js';

function testLevel(id) {
  const lvl = LEVELS.find(l => l.id === id);
  console.log(`\n=== Testing Level ${lvl.id}: ${lvl.title} ===`);
  console.log(`Par: ${lvl.parCards}, Available: ${lvl.availableCards.join(', ')}`);
  
  // Let's test basic sequential
  // And let's test with loops
}

testLevel(15);
testLevel(17);
testLevel(18);
testLevel(24);
testLevel(25);
testLevel(28);

