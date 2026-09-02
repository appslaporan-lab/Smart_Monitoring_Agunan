const fs = require('fs');

const path = 'app/collecting/page.tsx';
let code = fs.readFileSync(path, 'utf8');

const oldLogic = `const dynamicHariTunggakan = p.hariTunggakan + daysToAdd;`;
const newLogic = `const dynamicHariTunggakan = p.hariTunggakan > 0 ? p.hariTunggakan + daysToAdd : 0;`;

if (code.includes(oldLogic)) {
    code = code.replace(oldLogic, newLogic);
    fs.writeFileSync(path, code);
    console.log('Fixed dynamicHariTunggakan logic');
} else {
    console.log('Could not find dynamicHariTunggakan logic');
}
