const fs = require('fs');
let code = fs.readFileSync('components/ModuleSidebar.tsx', 'utf8');

if (!code.includes('/collecting/upload-teller')) {
  // Add icon
  if (!code.includes('FileSpreadsheet')) {
    code = code.replace("PlusCircle", "PlusCircle, FileSpreadsheet");
  }
  
  const oldText = `{ href: '/collecting/upload', label: 'Upload Nominatif', roles: ['SUPERADMIN'], icon: PlusCircle, module: 'collecting' },`;
  const newText = `{ href: '/collecting/upload', label: 'Upload Nominatif', roles: ['SUPERADMIN'], icon: PlusCircle, module: 'collecting' },\n  { href: '/collecting/upload-teller', label: 'Upload Data Teller', roles: ['SUPERADMIN'], icon: FileSpreadsheet, module: 'collecting' },`;
  
  code = code.replace(oldText, newText);
  fs.writeFileSync('components/ModuleSidebar.tsx', code);
}
console.log('Sidebar updated');
