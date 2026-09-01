const fs = require('fs');
let code = fs.readFileSync('app/performa/kolektibilitas/page.tsx', 'utf8');

const regexStyle = /<style dangerouslySetInnerHTML=\{\{__html: `[\s\S]*?`\}\} \/>/;

const newStyle = `<style dangerouslySetInnerHTML={{__html: \`
          @media print {
            @page { size: 330mm 215mm landscape; margin: 8mm; }
            body, html { margin: 0; padding: 0; background: white; }
            .container { max-width: 100% !important; width: 100% !important; padding: 0 !important; margin: 0 !important; zoom: 0.75; }
            .card { border: none !important; box-shadow: none !important; overflow: visible !important; overflow-x: visible !important; padding: 0 !important; margin-bottom: 30px !important; }
            table { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; width: 100% !important; table-layout: auto !important; border-collapse: collapse !important; page-break-inside: auto; }
            tr { page-break-inside: avoid; page-break-after: auto; }
            thead { display: table-header-group; }
            tfoot { display: table-footer-group; }
            table th, table td { 
              padding: 4px !important; 
              font-size: 10px !important; 
              white-space: nowrap !important;
            }
          }
        \`}} />`;

code = code.replace(regexStyle, newStyle);
fs.writeFileSync('app/performa/kolektibilitas/page.tsx', code);
console.log('Added page breaks');
