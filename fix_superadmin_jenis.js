const fs = require('fs');
let code = fs.readFileSync('components/SuperadminManageRealisasi.tsx', 'utf8');

const oldSelect = `<select value={editJenis} onChange={(e) => setEditJenis(e.target.value)} style={{ padding: 4, width: '100%' }}>
                          <option value="BARU">BARU</option>
                          <option value="TOP_UP">TOP UP</option>
                        </select>`;
                        
const newSelect = `<select value={editJenis} onChange={(e) => setEditJenis(e.target.value)} style={{ padding: 4, width: '100%' }}>
                          <option value="NASABAH_BARU">NASABAH BARU</option>
                          <option value="NASABAH_LAMA">NASABAH LAMA</option>
                          <option value="TOP_UP">TOP UP</option>
                        </select>`;

code = code.replace(oldSelect, newSelect);

// Display logic (in view mode)
const oldJenisDisplay = `{r.jenis.replace('_', ' ')}`;
// Wait, `{r.jenis.replace('_', ' ')}` is good enough. "NASABAH_BARU" will become "NASABAH BARU".

fs.writeFileSync('components/SuperadminManageRealisasi.tsx', code);
console.log('Superadmin editor updated');
