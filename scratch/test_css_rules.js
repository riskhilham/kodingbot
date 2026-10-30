import fs from 'fs';

const css = fs.readFileSync('assets/css/main.css', 'utf8');

const cssChecks = [
  { name: 'min-height: 0 on modal-scroll-body', test: css.includes('min-height: 0;') },
  { name: 'overscroll-behavior: contain', test: css.includes('overscroll-behavior: contain;') },
  { name: 'btn-intro-start in modal footer rule', test: css.includes('.modal-card>.btn-intro-start') },
  { name: 'btn-hint-continue in modal footer rule', test: css.includes('.modal-card>.btn-hint-continue') },
  { name: 'intro-card in portrait media query', test: css.includes('.intro-card') && css.includes('/* Modals on Mobile Portrait (Smartphone Tegak) */') },
  { name: 'intro-card in landscape media query', test: css.includes('/* Modals on Mobile Landscape (Smartphone Layar Miring) */') && css.includes('max-height: min(92vh, 92dvh);') },
  { name: 'btn-start-level pinned in landscape', test: css.includes('.btn-intro-start') },
  { name: 'btn-hint-continue pinned in landscape', test: css.includes('.btn-hint-continue') },
  { name: 'victory-modal-buttons row in landscape', test: css.includes('.victory-modal-buttons') },
];

console.log('--- CSS RULES VERIFICATION ---');
let allPassed = true;
for (const c of cssChecks) {
  console.log(`${c.test ? '[PASS]' : '[FAIL]'} ${c.name}`);
  if (!c.test) allPassed = false;
}

if (!allPassed) {
  process.exit(1);
} else {
  console.log('ALL CSS RULES CHECKS PASSED SUCCESSFULLY!');
}

