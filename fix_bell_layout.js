const fs = require('fs');
let code = fs.readFileSync('app/layout.tsx', 'utf8');

if (!code.includes('NotificationBell')) {
  code = code.replace("import ModuleSidebar", "import NotificationBell from '@/components/NotificationBell';\nimport ModuleSidebar");
  
  const oldTopbar = `<header className="app-topbar">
              <div />
              <div className="topbar-actions" />
            </header>`;
            
  const newTopbar = `<header className="app-topbar">
              <div style={{ flex: 1 }} />
              <div className="topbar-actions" style={{ display: 'flex', alignItems: 'center', paddingRight: '20px' }}>
                <NotificationBell />
              </div>
            </header>`;
            
  code = code.replace(oldTopbar, newTopbar);
  fs.writeFileSync('app/layout.tsx', code);
}
console.log('Bell added to layout');
