const fs = require('fs');
let code = fs.readFileSync('app/kpi/teller/transaksi-harian/page.tsx', 'utf8');

// Add Tanggal state
code = code.replace(
  "const [file, setFile] = useState<File | null>(null);",
  "const [file, setFile] = useState<File | null>(null);\n  const [tanggal, setTanggal] = useState<string>(new Date().toISOString().split('T')[0]);"
);

// Add formData append
code = code.replace(
  "formData.append('file', file);",
  "formData.append('file', file);\n      formData.append('tanggal', tanggal);"
);

// Add Input UI
const dateInput = `
            <div className="form-group" style={{ marginBottom: 20 }}>
              <label className="label">Tanggal Laporan</label>
              <input 
                type="date" 
                className="inputField" 
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                required
              />
            </div>
`;
code = code.replace(
  '<div className="form-group" style={{ marginBottom: 24 }}>',
  dateInput + '\n            <div className="form-group" style={{ marginBottom: 24 }}>'
);

// Add Error Card to output
const errorCard = `
            {/* Kesalahan */}
            <div className="metric-card" style={{ background: '#fff1f2', borderColor: '#fecdd3' }}>
              <div className="metric-accent" style={{ background: '#e11d48' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ background: '#ffe4e6', padding: 12, borderRadius: '50%', color: '#e11d48' }}>
                  <AlertCircle size={32} />
                </div>
                <div>
                  <div style={{ fontSize: 14, color: '#e11d48', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Kesalahan (Minus)</div>
                  <div style={{ fontSize: 24, fontWeight: 'bold', color: '#0f172a' }}>{result.errorCount}</div>
                  <div style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>Terdeteksi otomatis</div>
                </div>
              </div>
            </div>
`;

code = code.replace(
  "{/* Pencairan */}",
  errorCard + "\n            {/* Pencairan */}"
);

fs.writeFileSync('app/kpi/teller/transaksi-harian/page.tsx', code);
console.log('UI updated');
