const fs = require('fs');
let code = fs.readFileSync('app/collecting/pinjaman/[id]/page.tsx', 'utf8');

if (!code.includes('SUDAH BAYAR HARI INI')) {
  const oldText = `<h1 style={{ margin: '0 0 4px 0', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {pinjaman.norek}`;
  const newText = `<h1 style={{ margin: '0 0 4px 0', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {pinjaman.norek}
            {pinjaman.sudahBayar && (
              <span style={{ 
                padding: '2px 8px', 
                borderRadius: 12, 
                fontSize: '0.75rem', 
                background: '#dcfce7', 
                color: '#166534', 
                fontWeight: 'bold',
                border: '1px solid #bbf7d0',
                marginLeft: '8px'
              }}>
                SUDAH BAYAR HARI INI {pinjaman.nominalBayarHariIni ? \`(Rp \${pinjaman.nominalBayarHariIni.toLocaleString('id-ID')})\` : ''}
              </span>
            )}`;
            
  code = code.replace(oldText, newText.replace(/\\`/g, '`').replace(/\\\$/g, '$'));
  fs.writeFileSync('app/collecting/pinjaman/[id]/page.tsx', code);
}
console.log('UI details updated');
