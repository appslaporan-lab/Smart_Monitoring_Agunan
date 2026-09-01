const fs = require('fs');
let code = fs.readFileSync('app/performa/kolektibilitas/page.tsx', 'utf8');

if (!code.includes('PrintButton')) {
  code = code.replace("import Link from 'next/link';", "import Link from 'next/link';\nimport PrintButton from '@/components/PrintButton';");
  
  const oldText = `<Link href="/admin/upload-nominatif?type=performa" className="button secondary">Kelola Data Laporan</Link>`;
  const newText = `<div style={{ display: 'flex', gap: '8px' }}>\n            <PrintButton />\n            <Link href="/admin/upload-nominatif?type=performa" className="button secondary no-print">Kelola Data Laporan</Link>\n          </div>`;
  
  code = code.replace(oldText, newText);
  
  // Inject style for F4
  const styleInjection = `
        <style dangerouslySetInnerHTML={{__html: \`
          @media print {
            @page { size: 330mm 215mm landscape; margin: 10mm; }
            body { zoom: 0.9; }
            .card { border: none !important; box-shadow: none !important; }
            table th { background-color: #e2e8f0 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            table th[colspan="2"] { background-color: #86efac !important; }
            table th[colspan="2"] + th[colspan="2"] { background-color: #fca5a5 !important; }
            table th[colspan="2"] + th[colspan="2"] + th[colspan="2"] { background-color: #e2e8f0 !important; }
            table th[rowspan="2"]:last-child { background-color: #fef08a !important; }
          }
        \`}} />
  `;
  code = code.replace("<main className=\"container\">", "<main className=\"container\">" + styleInjection);
  
  fs.writeFileSync('app/performa/kolektibilitas/page.tsx', code);
}
console.log('Kolektibilitas updated');
