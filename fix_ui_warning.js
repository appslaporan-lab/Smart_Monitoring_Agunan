const fs = require('fs');
let code = fs.readFileSync('app/kpi/teller/transaksi-harian/page.tsx', 'utf8');

const warningAlert = `
          {result.setoran.count === 0 && result.penarikan.count === 0 && result.angsuran.count === 0 && result.pencairanPinjaman.count === 0 && result.pencairanDeposito.count === 0 && result.foundUsers && result.foundUsers.length > 0 && (
            <div className="alert alert-warning" style={{ marginBottom: 24, display: 'flex', gap: 12, alignItems: 'flex-start', background: '#fffbeb', color: '#b45309', padding: 16, borderRadius: 8 }}>
              <AlertCircle size={24} style={{ flexShrink: 0 }} />
              <div>
                <strong>Nol Transaksi Terdeteksi!</strong>
                <p style={{ margin: '4px 0 0' }}>File yang Anda unggah berisi transaksi milik teller <strong>{result.foundUsers.join(', ')}</strong>, sedangkan Anda login sebagai akun lain.</p>
                <p style={{ margin: '4px 0 0', fontSize: 13, opacity: 0.8 }}>Sistem secara otomatis memblokir transaksi ini agar tidak salah masuk ke rapor performa Anda (sesuai aturan "cocokkan nama user dengan nama di file"). Harap login menggunakan akun teller yang bersangkutan.</p>
              </div>
            </div>
          )}

          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
`;

code = code.replace(
  /<div className="grid" style={{ gridTemplateColumns: 'repeat\(auto-fit, minmax\(280px, 1fr\)\)', gap: 24 }}>/,
  warningAlert
);

fs.writeFileSync('app/kpi/teller/transaksi-harian/page.tsx', code);
console.log('UI updated with warning');
