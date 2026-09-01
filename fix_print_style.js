const fs = require('fs');
let code = fs.readFileSync('app/performa/kolektibilitas/page.tsx', 'utf8');

const oldStyle = `<style dangerouslySetInnerHTML={{__html: \`
          @media print {
            @page { size: 330mm 215mm landscape; margin: 10mm; }
            body { zoom: 0.9; }
            .card { border: none !important; box-shadow: none !important; }
            table { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            table th[colspan="2"] { background-color: #86efac !important; }
            table th[colspan="2"] + th[colspan="2"] { background-color: #fca5a5 !important; }
            table th[colspan="2"] + th[colspan="2"] + th[colspan="2"] { background-color: #e2e8f0 !important; }
            table th[rowspan="2"]:last-child { background-color: #fef08a !important; }
          }
        \`}} />`;

const newStyle = `<style dangerouslySetInnerHTML={{__html: \`
          @media print {
            @page { size: 330mm 215mm landscape; margin: 5mm; }
            body { font-family: sans-serif; }
            .container { max-width: 100% !important; width: 100% !important; padding: 0 !important; margin: 0 !important; }
            .card { border: none !important; box-shadow: none !important; overflow: visible !important; overflow-x: visible !important; padding: 0 !important; }
            table { -webkit-print-color-adjust: exact; print-color-adjust: exact; width: 100% !important; table-layout: fixed; }
            table th, table td { padding: 4px 2px !important; font-size: 8.5px !important; word-wrap: break-word; }
            table th[colspan="2"] { background-color: #86efac !important; }
            table th[colspan="2"] + th[colspan="2"] { background-color: #fca5a5 !important; }
            table th[colspan="2"] + th[colspan="2"] + th[colspan="2"] { background-color: #e2e8f0 !important; }
            table th[rowspan="2"]:last-child { background-color: #fef08a !important; }
          }
        \`}} />`;

code = code.replace(oldStyle, newStyle);
fs.writeFileSync('app/performa/kolektibilitas/page.tsx', code);
console.log('Fixed kolektibilitas style');
