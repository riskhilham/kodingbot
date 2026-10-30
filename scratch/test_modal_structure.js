import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const checks = [
  { name: 'modal-level-intro exists', test: html.includes('id="modal-level-intro"') },
  { name: 'intro-scroll-body exists', test: html.includes('intro-scroll-body') },
  { name: 'btn-start-level has btn-intro-start', test: html.includes('btn-intro-start') },
  { name: 'modal-level-hint exists', test: html.includes('id="modal-level-hint"') },
  { name: 'btn-hint-continue exists', test: html.includes('btn-hint-continue') },
  { name: 'modal-victory exists', test: html.includes('id="modal-victory"') },
  { name: 'victory-scroll-body exists', test: html.includes('victory-scroll-body') },
  { name: 'btn-victory-next exists', test: html.includes('id="btn-victory-next"') },
  { name: 'btn-victory-replay exists', test: html.includes('id="btn-victory-replay"') },
  { name: 'modal-how-to exists', test: html.includes('id="modal-how-to"') },
  { name: 'modal-about exists', test: html.includes('id="modal-about"') },
  { name: 'modal-game-dialog exists', test: html.includes('id="modal-game-dialog"') },
];

console.log('--- MODAL STRUCTURE VERIFICATION ---');
let allPassed = true;
for (const c of checks) {
  console.log(`${c.test ? '[PASS]' : '[FAIL]'} ${c.name}`);
  if (!c.test) allPassed = false;
}

if (!allPassed) {
  process.exit(1);
} else {
  console.log('ALL MODAL DOM CHECKS PASSED SUCCESSFULLY!');
}

