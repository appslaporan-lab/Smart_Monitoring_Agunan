const fs = require('fs');
let code = fs.readFileSync('app/auth/login/page.tsx', 'utf8');

const importAdd = `import PasswordInput from './PasswordInput';\n`;
if (!code.includes('import PasswordInput')) {
  code = code.replace("import { generateCaptcha } from '@/lib/captcha';", "import { generateCaptcha } from '@/lib/captcha';\n" + importAdd);
}

const oldInput = `<input type="password" name="password" className="inputField" placeholder="Masukkan password" required />`;
const newInput = `<PasswordInput />`;

if (code.includes(oldInput)) {
  code = code.replace(oldInput, newInput);
  fs.writeFileSync('app/auth/login/page.tsx', code);
  console.log('Replaced password input');
} else {
  console.log('Could not find old password input');
}
