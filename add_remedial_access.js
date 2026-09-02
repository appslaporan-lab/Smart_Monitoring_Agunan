const fs = require('fs');

const filesToPatch = [
    {
        path: 'app/collecting/upload/page.tsx',
        old: `if (user.role !== 'SUPERADMIN') redirect('/collecting');`,
        new: `if (user.role !== 'SUPERADMIN' && user.role !== 'KASUBAG_REMEDIAL') redirect('/collecting');`
    },
    {
        path: 'app/admin/ao/page.tsx',
        old: `if (!user || user.role !== 'SUPERADMIN') redirect('/');`,
        new: `if (!user || (user.role !== 'SUPERADMIN' && user.role !== 'KASUBAG_REMEDIAL')) redirect('/');`
    },
    {
        path: 'app/api/collecting/upload-nominatif/route.ts',
        old: `if (!user || user.role !== 'SUPERADMIN') {`,
        new: `if (!user || (user.role !== 'SUPERADMIN' && user.role !== 'KASUBAG_REMEDIAL')) {`
    },
    {
        path: 'app/api/collecting/upload-teller/route.ts',
        old: `if (!user || user.role !== 'SUPERADMIN') {`,
        new: `if (!user || (user.role !== 'SUPERADMIN' && user.role !== 'KASUBAG_REMEDIAL')) {`
    },
    {
        path: 'app/collecting/page.tsx',
        old: `user.role === 'SUPERADMIN'`,
        new: `(user.role === 'SUPERADMIN' || user.role === 'KASUBAG_REMEDIAL')`
    }
];

for (const patch of filesToPatch) {
    if (fs.existsSync(patch.path)) {
        let code = fs.readFileSync(patch.path, 'utf8');
        // specifically for app/collecting/page.tsx, replace ALL instances
        if (patch.path === 'app/collecting/page.tsx') {
            code = code.replace(/user\.role === 'SUPERADMIN'/g, patch.new);
        } else {
            code = code.replace(patch.old, patch.new);
        }
        fs.writeFileSync(patch.path, code);
        console.log(`Patched ${patch.path}`);
    }
}
