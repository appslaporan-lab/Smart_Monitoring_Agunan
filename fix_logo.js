const fs = require('fs');

// --- LOGIN PAGE ---
let loginCode = fs.readFileSync('app/auth/login/page.tsx', 'utf8');
loginCode = loginCode.replace(
  /<div className="login-graphic-logo">\s*<Shield size=\{36\} strokeWidth=\{2\.5\} \/>\s*<\/div>/,
  `<div className="login-graphic-logo" style={{ background: 'transparent', padding: 0, boxShadow: 'none' }}>
              <img src="/logo-bpr-resmi.png" alt="Logo BPR" style={{ width: '100px', height: 'auto', objectFit: 'contain' }} />
            </div>`
);
fs.writeFileSync('app/auth/login/page.tsx', loginCode);

// --- SIDEBAR ---
let sidebarCode = fs.readFileSync('components/ModuleSidebar.tsx', 'utf8');
sidebarCode = sidebarCode.replace(
  /<div className="app-logo-icon">\s*<Shield size=\{20\} \/>\s*<\/div>/,
  `<div className="app-logo-icon" style={{ background: 'transparent', color: 'inherit' }}>
            <img src="/logo-bpr-resmi.png" alt="Logo BPR" style={{ width: '28px', height: 'auto', objectFit: 'contain' }} />
          </div>`
);
// Replace "BPR Suite" text with just the logo, or keep the text?
// Usually, we keep the text "BPR Tulungagung" or something, but the logo itself might contain the text.
// Let's replace "BPR Suite" with "PT BPR Bank T.A." or something if it's too long, but it's fine.
fs.writeFileSync('components/ModuleSidebar.tsx', sidebarCode);
console.log('Logos replaced');
