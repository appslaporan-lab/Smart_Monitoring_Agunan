const fs = require('fs');
let code = fs.readFileSync('components/ModuleSidebar.tsx', 'utf8');

// Add Settings module
if (!code.includes("key: 'settings'")) {
  code = code.replace(
    "{ key: 'performa', label: 'Performa Kantor', icon: BarChart3, pathPrefix: '/performa' },",
    "{ key: 'performa', label: 'Performa Kantor', icon: BarChart3, pathPrefix: '/performa' },\n    { key: 'settings', label: 'Pengaturan', icon: Settings, pathPrefix: '/settings' },"
  );
}

// Change Approval User module
code = code.replace(
  "module: 'agunan' },\n  { href: '/', label: 'Dashboard'",
  "module: 'settings' },\n  { href: '/', label: 'Dashboard'"
);

// Change Ganti Password module
code = code.replace(
  "icon: Shield, module: 'agunan' },",
  "icon: Shield, module: 'settings' },"
);

// Update activeModuleKey logic to be robust
const oldLogic = `const activeModuleKey =
    visibleModules.find((m) => m.pathPrefix !== '/' && pathname.startsWith(m.pathPrefix))?.key
    || (visibleModules.some((m) => m.key === 'agunan') ? 'agunan' : visibleModules[0]?.key);`;

const newLogic = `let activeModuleKey = visibleMenuAll.find(item => item.href !== '/' && pathname.startsWith(item.href))?.module;
  if (!activeModuleKey && pathname === '/') activeModuleKey = 'agunan';
  if (!activeModuleKey) activeModuleKey = visibleModules.some((m) => m.key === 'agunan') ? 'agunan' : visibleModules[0]?.key;`;

code = code.replace(oldLogic, newLogic);

fs.writeFileSync('components/ModuleSidebar.tsx', code);
console.log('Settings module separated');
