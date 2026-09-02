const fs = require('fs');
const path = 'app/collecting/page.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(`actionLabel={(user.role === 'SUPERADMIN' || user.role === 'KASUBAG_REMEDIAL') ? "Upload Nominatif Sekarang" : undefined}`, `actionLabel={user.role === 'SUPERADMIN' ? "Upload Nominatif Sekarang" : undefined}`);
code = code.replace(`actionHref={(user.role === 'SUPERADMIN' || user.role === 'KASUBAG_REMEDIAL') ? "/collecting/upload" : undefined}`, `actionHref={user.role === 'SUPERADMIN' ? "/collecting/upload" : undefined}`);
code = code.replace(`{(user.role === 'SUPERADMIN' || user.role === 'KASUBAG_REMEDIAL') && (
            <Link href="/collecting/upload" className="button secondary">Kelola Upload Nominatif</Link>
          )}`, `{user.role === 'SUPERADMIN' && (
            <Link href="/collecting/upload" className="button secondary">Kelola Upload Nominatif</Link>
          )}`);

fs.writeFileSync(path, code);
console.log('Reverted buttons in collecting page');
