const fs = require('fs');
let code = fs.readFileSync('app/performa/kolektibilitas/page.tsx', 'utf8');

code = code.replace(/stats\.total\.os \+= r\.outstanding;/g, 'stats.total.os += (r.outstanding || 0);');
code = code.replace(/stats\.k1\.os \+= r\.outstanding;/g, 'stats.k1.os += (r.outstanding || 0);');
code = code.replace(/stats\.k2\.os \+= r\.outstanding;/g, 'stats.k2.os += (r.outstanding || 0);');
code = code.replace(/stats\.k3\.os \+= r\.outstanding;/g, 'stats.k3.os += (r.outstanding || 0);');
code = code.replace(/stats\.k4\.os \+= r\.outstanding;/g, 'stats.k4.os += (r.outstanding || 0);');
code = code.replace(/stats\.k5\.os \+= r\.outstanding;/g, 'stats.k5.os += (r.outstanding || 0);');

code = code.replace(/const c = currentStats\[key\];/g, 'const c = (currentStats as any)[key];');
code = code.replace(/const p = prevStats\[key\];/g, 'const p = (prevStats as any)[key];');

code = code.replace(/if \(currentStats\[key\]\.os/g, 'if ((currentStats as any)[key].os');
code = code.replace(/prevStats\[key\]\.os/g, '(prevStats as any)[key].os');
code = code.replace(/currentStats\[key\]\.noa/g, '(currentStats as any)[key].noa');
code = code.replace(/prevStats\[key\]\.noa/g, '(prevStats as any)[key].noa');

fs.writeFileSync('app/performa/kolektibilitas/page.tsx', code);
console.log('Fixed TS errors in comparison');
