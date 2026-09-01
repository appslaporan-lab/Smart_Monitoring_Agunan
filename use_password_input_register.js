const fs = require('fs');
let code = fs.readFileSync('app/auth/register/page.tsx', 'utf8');

const importAdd = `import PasswordInput from '../login/PasswordInput';\n`;
if (!code.includes('import PasswordInput')) {
  code = code.replace("import { submitRegistration } from './actions';", "import { submitRegistration } from './actions';\n" + importAdd);
}

const oldInput = `<input
                type="password"
                name="password"
                className="inputField"
                required
                minLength={6}
              />`;

const newInput = `<PasswordInput />`;

// Let's just use regex to replace `<input type="password" ... />`
code = code.replace(/<input\s+type="password"\s+name="password"\s+className="inputField"\s+required\s+(?:minLength=\{6\}\s+)?\/>/m, '<PasswordInput />');

fs.writeFileSync('app/auth/register/page.tsx', code);
console.log('Replaced in register page');
