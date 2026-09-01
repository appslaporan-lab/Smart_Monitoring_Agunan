const fs = require('fs');
let code = fs.readFileSync('app/collecting/pinjaman/[id]/KunjunganForm.tsx', 'utf8');

// 1. Add state
code = code.replace("const [catatan, setCatatan] = useState('');", "const [catatan, setCatatan] = useState('');\n  const [penerimaSurat, setPenerimaSurat] = useState('');");

// 2. Add to body
code = code.replace("catatan,\n            fotoDataUrl,", "catatan,\n            penerimaSurat,\n            fotoDataUrl,");

// 3. Add to dropdown
const oldDropdown = `<option value="KUNJUNGAN">Kunjungan Langsung</option>\n            <option value="TELEPON">Telepon</option>`;
const newDropdown = `<option value="KUNJUNGAN">Kunjungan Langsung</option>\n            <option value="TELEPON">Telepon</option>\n            <option value="SURAT_TAGIHAN_1">Kirim Surat Tagihan 1</option>\n            <option value="SURAT_TAGIHAN_2">Kirim Surat Tagihan 2</option>\n            <option value="SP_1">Kirim Surat Peringatan 1</option>\n            <option value="SP_2">Kirim Surat Peringatan 2</option>\n            <option value="SP_3">Kirim Surat Peringatan 3</option>`;
code = code.replace(oldDropdown, newDropdown);

// 4. Add penerimaSurat input
const penerimaInput = `{ (jenisKontak.includes('SURAT') || jenisKontak.includes('SP')) && (
          <div>
            <label className="label">Diterima Oleh (Nama / Hubungan)</label>
            <input className="inputField" type="text" value={penerimaSurat} onChange={(e) => setPenerimaSurat(e.target.value)} placeholder="Contoh: Istri (Ibu Budi)" required />
          </div>
        ) }`;
code = code.replace("<div>\n          <label className=\"label\">Hasil</label>", penerimaInput + "\n        <div>\n          <label className=\"label\">Hasil</label>");

fs.writeFileSync('app/collecting/pinjaman/[id]/KunjunganForm.tsx', code);
console.log('KunjunganForm updated');
