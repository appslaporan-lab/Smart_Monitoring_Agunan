const fs = require('fs');
let code = fs.readFileSync('components/ModuleSidebar.tsx', 'utf8');

if (!code.includes('/superadmin/audit-log')) {
  // Add icon
  if (!code.includes('Activity,')) {
    code = code.replace("Settings\n}", "Settings, Activity\n}");
  }
  
  // Add menu
  const menuInsert = `{ href: '/superadmin/audit-log', label: 'Log Aktivitas', roles: ['SUPERADMIN', 'DIREKTUR', 'DIREKSI'], icon: Activity, module: 'settings' },`;
  code = code.replace(
    "{ href: '/superadmin/users', label: 'Approval User', roles: ['SUPERADMIN'], icon: UserCog, module: 'settings' },",
    `{ href: '/superadmin/users', label: 'Approval User', roles: ['SUPERADMIN'], icon: UserCog, module: 'settings' },\n    ${menuInsert}`
  );
  fs.writeFileSync('components/ModuleSidebar.tsx', code);
}
console.log('Sidebar updated with Audit Log');
