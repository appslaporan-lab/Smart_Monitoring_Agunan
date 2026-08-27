const fs = require('fs');

// 1. app/collecting/page.tsx
let pageCode = fs.readFileSync('app/collecting/page.tsx', 'utf8');
if (!pageCode.includes('isLunas: p.isLunas')) {
  pageCode = pageCode.replace("sudahBayar: p.sudahBayar,", "sudahBayar: p.sudahBayar,\n      isLunas: p.isLunas,");
  fs.writeFileSync('app/collecting/page.tsx', pageCode);
}

// 2. app/collecting/CollectingDebiturList.tsx
let listCode = fs.readFileSync('app/collecting/CollectingDebiturList.tsx', 'utf8');
if (!listCode.includes('isLunas: boolean')) {
  listCode = listCode.replace("sudahBayar: boolean;", "sudahBayar: boolean;\n  isLunas: boolean;");
  
  // Add LUNAS filter
  const lunasFilter = `{ key: 'LUNAS', label: 'Lunas', match: (i) => i.isLunas },`;
  listCode = listCode.replace("{ key: 'SUDAH_BAYAR'", lunasFilter + "\n    { key: 'SUDAH_BAYAR'");
  
  // Exclude from Belum Dikunjungi
  listCode = listCode.replace("&& !i.sudahBayar", "&& !i.sudahBayar && !i.isLunas");
  
  // Colors and labels
  listCode = listCode.replace("SUDAH_BAYAR: '#22c55e',", "SUDAH_BAYAR: '#22c55e',\n    LUNAS: '#3b82f6',");
  listCode = listCode.replace("SUDAH_BAYAR: 'Sudah Bayar',", "SUDAH_BAYAR: 'Sudah Bayar',\n    LUNAS: 'Lunas',");
  
  // Badge UI
  const badgeUI = `{item.sudahBayar && (
                    <span style={{ 
                      padding: '2px 8px', 
                      borderRadius: 12, 
                      fontSize: '0.75rem', 
                      background: item.isLunas ? '#dbeafe' : '#dcfce7', 
                      color: item.isLunas ? '#1d4ed8' : '#166534', 
                      fontWeight: 'bold',
                      border: \`1px solid \${item.isLunas ? '#bfdbfe' : '#bbf7d0'}\`
                    }}>
                      {item.isLunas ? 'LUNAS' : 'SUDAH BAYAR'} {item.nominalBayarHariIni ? \`(Rp \${item.nominalBayarHariIni.toLocaleString('id-ID')})\` : ''}
                    </span>
                  )}`;
                  
  listCode = listCode.replace(/\{item\.sudahBayar && \([\s\S]*?\)\}/, badgeUI);
  fs.writeFileSync('app/collecting/CollectingDebiturList.tsx', listCode);
}

// 3. app/collecting/pinjaman/[id]/page.tsx
let detailCode = fs.readFileSync('app/collecting/pinjaman/[id]/page.tsx', 'utf8');
if (!detailCode.includes('pinjaman.isLunas')) {
  const oldBadge = `{pinjaman.sudahBayar && (
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
                SUDAH BAYAR HARI INI {pinjaman.nominalBayarHariIni ? \\\`(Rp \\\${pinjaman.nominalBayarHariIni.toLocaleString('id-ID')})\\\` : ''}
              </span>
            )}`;
  
  const newBadge = `{pinjaman.sudahBayar && (
              <span style={{ 
                padding: '2px 8px', 
                borderRadius: 12, 
                fontSize: '0.75rem', 
                background: pinjaman.isLunas ? '#dbeafe' : '#dcfce7', 
                color: pinjaman.isLunas ? '#1d4ed8' : '#166534', 
                fontWeight: 'bold',
                border: \\\`1px solid \\\${pinjaman.isLunas ? '#bfdbfe' : '#bbf7d0'}\\\`,
                marginLeft: '8px'
              }}>
                {pinjaman.isLunas ? 'LUNAS' : 'SUDAH BAYAR HARI INI'} {pinjaman.nominalBayarHariIni ? \\\`(Rp \\\${pinjaman.nominalBayarHariIni.toLocaleString('id-ID')})\\\` : ''}
              </span>
            )}`;
            
  // Use a simpler replace method for the badge inside detailCode
  // Wait, I can just replace the whole text. 
  // Actually regex replace is easier.
  detailCode = detailCode.replace(/\{pinjaman\.sudahBayar && \([\s\S]*?\)\}/, newBadge.replace(/\\\\`/g, '`').replace(/\\\\\\$/g, '$'));
  fs.writeFileSync('app/collecting/pinjaman/[id]/page.tsx', detailCode);
}
console.log('UI updated for Lunas');
