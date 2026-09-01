const fs = require('fs');
let code = fs.readFileSync('components/ModuleSidebar.tsx', 'utf8');

const oldLogic = `  if (!activeModuleKey && pathname === '/') activeModuleKey = 'agunan';
  if (!activeModuleKey) activeModuleKey = visibleModules.some((m) => m.key === 'agunan') ? 'agunan' : visibleModules[0]?.key;`;

const newLogic = `  if (!activeModuleKey && pathname === '/') {
    activeModuleKey = visibleModules.some((m) => m.key === 'agunan') ? 'agunan' : visibleModules[0]?.key;
  }
  if (!activeModuleKey) {
    activeModuleKey = visibleModules[0]?.key;
  }`;

code = code.replace(oldLogic, newLogic);
fs.writeFileSync('components/ModuleSidebar.tsx', code);
console.log('Fixed activeModuleKey default fallback logic');
