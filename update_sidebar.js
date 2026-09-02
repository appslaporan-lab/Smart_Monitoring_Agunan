const fs = require('fs');
const path = 'components/ModuleSidebar.tsx';
let code = fs.readFileSync(path, 'utf8');

let modifiedLines = [];
for (const line of code.split('\n')) {
    let newLine = line;
    if (line.includes("module: 'collecting'") || line.includes("module: 'performa'")) {
        if (!line.includes("KASUBAG_REMEDIAL")) {
            const rolesMatch = line.match(/roles: \[(.*?)\]/);
            if (rolesMatch) {
                const inner = rolesMatch[1];
                const newInner = inner ? inner + ',"KASUBAG_REMEDIAL"' : '"KASUBAG_REMEDIAL"';
                newLine = line.replace(rolesMatch[0], 'roles: [' + newInner + ']');
            }
        }
    }
    modifiedLines.push(newLine);
}

fs.writeFileSync(path, modifiedLines.join('\n'));
console.log('Sidebar updated');
