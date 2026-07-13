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
              <label className="label">Email</label>
              <input type="email" name="email" className="inputField" required />
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" name="password" className="inputField" required minLength={6} />
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
