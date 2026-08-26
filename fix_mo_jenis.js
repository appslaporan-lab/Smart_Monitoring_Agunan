const fs = require('fs');

// 1. Update Input Page
let inputCode = fs.readFileSync('app/kpi/mo-realisasi/input/page.tsx', 'utf8');

// Change default state if it's BARU
inputCode = inputCode.replace("const [jenis, setJenis] = useState('BARU');", "const [jenis, setJenis] = useState('NASABAH_BARU');");

// Update radio buttons
const oldRadios = `<div style={{ display: 'flex', gap: 16 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="radio" name="jenis" value="BARU" checked={jenis === 'BARU'} onChange={() => setJenis('BARU')} />
                Realisasi Baru
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="radio" name="jenis" value="TOP_UP" checked={jenis === 'TOP_UP'} onChange={() => setJenis('TOP_UP')} />
                Top Up
              </label>
            </div>`;

const newRadios = `<div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="radio" name="jenis" value="NASABAH_BARU" checked={jenis === 'NASABAH_BARU'} onChange={() => setJenis('NASABAH_BARU')} />
                Nasabah Baru
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="radio" name="jenis" value="NASABAH_LAMA" checked={jenis === 'NASABAH_LAMA'} onChange={() => setJenis('NASABAH_LAMA')} />
                Nasabah Lama
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="radio" name="jenis" value="TOP_UP" checked={jenis === 'TOP_UP'} onChange={() => setJenis('TOP_UP')} />
                Top Up
              </label>
            </div>`;

inputCode = inputCode.replace(oldRadios, newRadios);

fs.writeFileSync('app/kpi/mo-realisasi/input/page.tsx', inputCode);

// 2. Update Dashboard (if it renders Jenis)
let dashboardCode = fs.readFileSync('app/kpi/mo-realisasi/page.tsx', 'utf8');

// The dashboard renders SuperadminManageRealisasi for Superadmins, which shows the details.
// Let's check if we need to update it.

console.log('Input page updated');
