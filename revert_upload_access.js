const fs = require('fs');

const revertPatches = [
    {
        path: 'app/collecting/upload/page.tsx',
        oldStr: `if (user.role !== 'SUPERADMIN' && user.role !== 'KASUBAG_REMEDIAL') redirect('/collecting');`,
        newStr: `if (user.role !== 'SUPERADMIN') redirect('/collecting');`
    },
    {
        path: 'app/api/collecting/upload-nominatif/route.ts',
        oldStr: `if (user.role !== 'SUPERADMIN' && user.role !== 'KASUBAG_REMEDIAL') {`,
        newStr: `if (user.role !== 'SUPERADMIN') {`
    },
    {
        path: 'app/api/collecting/upload-teller/route.ts',
        oldStr: `if (!user || (user.role !== 'SUPERADMIN' && user.role !== 'KASUBAG_REMEDIAL')) {`,
        newStr: `if (!user || user.role !== 'SUPERADMIN') {`
    }
];

for (const patch of revertPatches) {
    if (fs.existsSync(patch.path)) {
        let code = fs.readFileSync(patch.path, 'utf8');
        code = code.replace(patch.oldStr, patch.newStr);
        fs.writeFileSync(patch.path, code);
        console.log(`Reverted access in ${patch.path}`);
    }
}

// Modify Sidebar
const sidebarPath = 'components/ModuleSidebar.tsx';
let sidebarCode = fs.readFileSync(sidebarPath, 'utf8');
let modifiedLines = [];
for (const line of sidebarCode.split('\\n')) {
    let newLine = line;
    if (line.includes("href: '/collecting/upload'") || line.includes("href: '/collecting/upload-teller'")) {
        // Remove KASUBAG_REMEDIAL from these two lines
        newLine = line.replace(/,"KASUBAG_REMEDIAL"/g, '');
    }
    modifiedLines.push(newLine);
}
fs.writeFileSync(sidebarPath, modifiedLines.join('\\n'));
console.log('Sidebar updated');
