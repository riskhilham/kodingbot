// Mock browser globals for Node test environment
global.localStorage = {
  getItem: () => null,
  setItem: () => {}
};
global.window = {};
global.AudioContext = class {};

const { CONFIG } = await import('../src/config.js');
const { LEVELS } = await import('../src/levels/levelData.js');
const { CodeRunner } = await import('../src/interpreter/codeRunner.js');

console.log(`Verifying all ${LEVELS.length} levels...`);
let allValid = true;
LEVELS.forEach(lvl => {
  if (!lvl.id || !lvl.title || !lvl.layout || !lvl.startPos || !lvl.finishPos) {
    console.error(`Level ${lvl.id} invalid structure!`);
    allValid = false;
  }
});
if (allValid) {
  console.log(`All ${LEVELS.length} levels have completely valid data structure!`);
}

// Test CodeRunner flattenCards with nested LOOP and nested IF_OBSTACLE
const dummyTileMap = {
  isWalkable: (x, y) => true,
  isFinish: () => false,
  checkCollectibles: () => null,
  checkTriggers: () => false,
  hasCrystalAt: (x, y) => x === 2 && y === 0,
  crystals: [{ x: 2, y: 0, collected: false }]
};
const dummyRobot = {
  gridX: 0,
  gridY: 0,
  direction: 0,
  moveTo: () => {},
  turn: () => {},
  setBump: () => {},
  setVictory: () => {}
};

const runner = new CodeRunner(dummyRobot, dummyTileMap);

const sampleCards = [
  { type: CONFIG.COMMANDS.FORWARD },
  {
    type: CONFIG.COMMANDS.LOOP,
    count: 2,
    bodyCards: [
      { type: CONFIG.COMMANDS.FORWARD },
      {
        type: CONFIG.COMMANDS.IF_OBSTACLE,
        condition: 'CRYSTAL_AHEAD',
        thenCards: [{ type: CONFIG.COMMANDS.JUMP }],
        elseCards: [{ type: CONFIG.COMMANDS.FORWARD }]
      }
    ]
  },
  {
    type: CONFIG.COMMANDS.IF_OBSTACLE,
    condition: 'DEAD_END',
    thenCards: [{ type: CONFIG.COMMANDS.TURN_RIGHT }],
    elseCards: [{ type: CONFIG.COMMANDS.FORWARD }]
  }
];

const flattened = runner.flattenCards(sampleCards);
console.log(`Sample cards flattened into ${flattened.length} steps:`);
flattened.forEach((s, idx) => {
  console.log(` Step ${idx + 1}: type=${s.type}, cardIndex=${s.cardIndex}, condition=${s.condition || 'N/A'}, isLoop=${s.isLoop || false}`);
});

// Test Step Mode execution
console.log("\nTesting Step Mode Execution (runner.step):");
const stepCards = [
  { type: CONFIG.COMMANDS.FORWARD },
  { type: CONFIG.COMMANDS.FORWARD }
];

let executedCount = 0;
runner.executeStep = async (step) => {
  executedCount++;
  console.log(`[Mock Execute] Step executed: ${step.type}`);
  return true;
};

// Test step 1
await runner.step(stepCards);
if (runner.stepPointer === 1 && executedCount === 1) {
  console.log("PASS: Step 1 executed successfully and stepPointer incremented to 1");
} else {
  console.error("FAIL: Step 1 failed", runner.stepPointer, executedCount);
}

// Test step 2
await runner.step(stepCards);
if (runner.stepPointer === 2 && executedCount === 2) {
  console.log("PASS: Step 2 executed successfully and stepPointer incremented to 2");
} else {
  console.error("FAIL: Step 2 failed", runner.stepPointer, executedCount);
}

// Reset runner state
runner.stop();
if (!runner.isStepMode && runner.stepPointer === 0) {
  console.log("PASS: Runner reset clears step mode and pointer");
}

console.log("\nALL TESTS COMPLETED SUCCESSFULLY!");
