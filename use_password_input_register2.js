const fs = require('fs');
let code = fs.readFileSync('app/auth/register/page.tsx', 'utf8');

code = code.replace(/<input\s+type="password"\s+name="password"\s+className="inputField"\s+required\s+minLength=\{8\}\s+\/>/m, '<PasswordInput minLength={8} />');

fs.writeFileSync('app/auth/register/page.tsx', code);
console.log('Replaced correctly in register page');
