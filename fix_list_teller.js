const fs = require('fs');
let code = fs.readFileSync('app/collecting/CollectingDebiturList.tsx', 'utf8');

// 1. Add fields to type
if (!code.includes('sudahBayar: boolean')) {
  code = code.replace("kolBulanLalu: string | null;", "kolBulanLalu: string | null;\n  sudahBayar: boolean;\n  nominalBayarHariIni: number | null;");
}

// 2. Add 'SUDAH_BAYAR' filter option BEFORE 'BELUM_DIKUNJUNGI'
const newFilter = `{ key: 'SUDAH_BAYAR', label: 'Sudah Bayar', match: (i) => i.sudahBayar },`;
if (!code.includes('SUDAH_BAYAR')) {
  code = code.replace("{ key: 'BELUM_DIKUNJUNGI'", newFilter + "\n  { key: 'BELUM_DIKUNJUNGI'");
}

// 3. Modify BELUM_DIKUNJUNGI logic to exclude sudahBayar!
if (!code.includes('&& !i.sudahBayar')) {
  code = code.replace("match: (i) => i.ews.wajibKunjungan && i.kunjunganCount === 0", "match: (i) => i.ews.wajibKunjungan && i.kunjunganCount === 0 && !i.sudahBayar");
}

// 4. Add Color
if (!code.includes("SUDAH_BAYAR: '#22c55e'")) {
  code = code.replace("BELUM_DIKUNJUNGI: '#94a3b8',", "BELUM_DIKUNJUNGI: '#94a3b8',\n    SUDAH_BAYAR: '#22c55e',");
  code = code.replace("BELUM_DIKUNJUNGI: 'Belum Dikunjungi',", "BELUM_DIKUNJUNGI: 'Belum Dikunjungi',\n    SUDAH_BAYAR: 'Sudah Bayar',");
}

// 5. In the UI list rendering, show a badge if already paid
const badgeUI = `{item.sudahBayar && (
                    <span style={{ 
                      padding: '2px 8px', 
                      borderRadius: 12, 
                      fontSize: '0.75rem', 
                      background: '#dcfce7', 
                      color: '#166534', 
                      fontWeight: 'bold',
                      border: '1px solid #bbf7d0'
                    }}>
                      SUDAH BAYAR {item.nominalBayarHariIni ? \`(Rp \${item.nominalBayarHariIni.toLocaleString('id-ID')})\` : ''}
                    </span>
                  )}`;

// Let's insert it inside the item name or tags container
if (!code.includes('SUDAH BAYAR')) {
  code = code.replace("</span>\n                </div>", "</span>\n                  " + badgeUI + "\n                </div>");
}

fs.writeFileSync('app/collecting/CollectingDebiturList.tsx', code);
console.log('List updated');
