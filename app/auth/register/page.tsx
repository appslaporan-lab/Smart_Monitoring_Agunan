import Link from 'next/link';

type RegisterPageProps = {
  searchParams?: { error?: string; success?: string };
};

const roles = [
  { value: 'ADM_KREDIT_PUSAT', label: 'ADM Kredit Pusat' },
  { value: 'ADM_KREDIT_CABANG', label: 'ADM Kredit Cabang' },
  { value: 'KEPALA_KAS', label: 'Kepala Kas' },
  { value: 'KASUBAG_PUSAT', label: 'Kasubag Pusat' },
  { value: 'KASUBAG_CABANG', label: 'Kasubag Cabang' },
  { value: 'KABAG_OPERASIONAL', label: 'Kabag Operasional' },
  { value: 'PIMPINAN_CABANG', label: 'Pimpinan Cabang' },
  { value: 'DIREKTUR', label: 'Direktur' },
  { value: 'TELLER', label: 'Teller' },
  { value: 'MO', label: 'MO (Marketing Officer)' },
  { value: 'PETUGAS_COLLECTING', label: 'Petugas Collecting' },
  { value: 'KASUBAG_KREDIT_PUSAT_1', label: 'Kasubag Kredit Pusat 1' },
  { value: 'KASUBAG_KREDIT_PUSAT_2', label: 'Kasubag Kredit Pusat 2' },
  { value: 'KASUBAG_KREDIT_CABANG', label: 'Kasubag Kredit Cabang' },
  { value: 'KABAG_MARKETING_PUSAT_1', label: 'Kabag Marketing Pusat 1' },
  { value: 'KABAG_MARKETING_PUSAT_2', label: 'Kabag Marketing Pusat 2' },
];

const kantorOptions = [
  { value: 'PUSAT_1', label: 'Pusat 1' },
  { value: 'PUSAT_2', label: 'Pusat 2' },
  { value: 'CABANG', label: 'Cabang' },
];

const subKantorOptions = [
  { value: '01', label: '01' },
  { value: '02', label: '02' },
  { value: '03', label: '03' },
  { value: '04', label: '04' },
  { value: '05', label: '05' },
  { value: '06', label: '06' },
  { value: '07', label: '07' },
  { value: '08', label: '08' },
  { value: '09', label: '09' },
  { value: '10', label: '10' },
  { value: '12', label: '12' },
  { value: '13', label: '13' },
  { value: '14', label: '14' },
  { value: '15', label: '15' },
];

export default function RegisterPage({ searchParams }: RegisterPageProps) {
  return (
    <main className="container">
      <section style={{ marginBottom: 32 }}>
        <h1>Daftar Pengguna Baru</h1>
        <p>Buat akun untuk salah satu role yang tersedia di sistem.</p>
      </section>
      <div className="card" style={{ padding: 24 }}>
        {searchParams?.error && <div className="alert alert-danger">{searchParams.error}</div>}
        {searchParams?.success && <div className="alert alert-info">{searchParams.success}</div>}
        <form method="post" action="/auth/register/api">
          <div style={{ display: 'grid', gap: 16 }}>
            <div>
              <label className="label">Nama Lengkap</label>
              <input name="nama" className="inputField" required />
            </div>
            <div>
              <label className="label">Username</label>
              <input type="text" name="username" className="inputField" required />
            </div>
            <div>
              <label className="label">Password</label>
              <input
  		type="password"
  		name="password"
  		className="inputField"
  		required
 		minLength={8}
  		pattern="(?=.*[A-Za-z])(?=.*\d).{8,}"
  		title="Minimal 8 karakter, kombinasi huruf dan angka"
	      />
	      <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 4 }}>Minimal 8 karakter, harus ada huruf dan angka.</p>
            </div>
            <div>
              <label className="label">Kantor</label>
              <select name="kantor" className="inputField" required>
                <option value="">Pilih kantor</option>
                {kantorOptions.map((kantor) => (
                  <option key={kantor.value} value={kantor.value}>{kantor.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Sub Kantor</label>
              <select name="subKantor" className="inputField" required>
                <option value="">Pilih sub kantor</option>
                {subKantorOptions.map((subKantor) => (
                  <option key={subKantor.value} value={subKantor.value}>{subKantor.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Role</label>
              <select name="role" className="inputField" required>
                <option value="">Pilih role</option>
                {roles.map((role) => (
                  <option key={role.value} value={role.value}>{role.label}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="button">Register</button>
          </div>
        </form>
        <p style={{ marginTop: 18 }}>
          Sudah punya akun? <Link href="/auth/login">Login</Link>
        </p>
      </div>
    </main>
  );
}