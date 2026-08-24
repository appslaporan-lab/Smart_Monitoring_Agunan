const fs = require('fs');
let code = fs.readFileSync('app/layout.tsx', 'utf8');

if (!code.includes('Toaster')) {
  code = code.replace("import ModuleSidebar", "import { Toaster } from 'react-hot-toast';\nimport ModuleSidebar");
  // Replace BOTH occurrences of <body suppressHydrationWarning> (one in the unauthenticated layout, one in authenticated layout)
  code = code.replace(/<body suppressHydrationWarning>/g, "<body suppressHydrationWarning>\n        <Toaster position=\"top-right\" />");
  fs.writeFileSync('app/layout.tsx', code);
  console.log('Toaster added');
}
