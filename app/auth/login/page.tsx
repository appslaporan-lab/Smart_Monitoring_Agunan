import Link from 'next/link';
import { Shield } from 'lucide-react';

type LoginPageProps = {
  searchParams?: { error?: string; success?: string };
};

export default function LoginPage({ searchParams }: LoginPageProps) {
  return (
    <main className="login-layout">
      {/* Left Graphic Side */}
      <div className="login-graphic">
        <div className="login-graphic-content">
          <div className="login-graphic-logo">
            <Shield size={36} strokeWidth={2.5} />
          </div>
          <h1>Selamat Datang Kembali</h1>
          <p>
            Sistem informasi terpadu untuk monitoring pergerakan dan status agunan kredit secara real-time. 
            Pastikan data agunan selalu aman dan termonitor dengan baik.
          </p>
        </div>
      </div>

      {/* Right Form Side */}
      <div className="login-form-container">
        <div className="login-card">
          <h2>Masuk ke Akun Anda</h2>
          <p>Silakan masukkan kredensial Anda untuk melanjutkan</p>

          {searchParams?.error && <div className="alert alert-danger">{searchParams.error}</div>}
          {searchParams?.success && <div className="alert alert-info">{searchParams.success}</div>}
          
          <form method="post" action="/auth/login/api">
            <div className="login-form-group">
              <label className="label">Username</label>
              <input type="text" name="username" className="inputField" placeholder="Masukkan username" required />
            </div>
            
            <div className="login-form-group">
              <label className="label">Password</label>
              <input type="password" name="password" className="inputField" placeholder="Masukkan password" required />
            </div>

            <button type="submit" className="button" style={{ width: '100%', marginTop: '8px' }}>
              Masuk
            </button>
          </form>

          <div className="login-footer">
            Belum punya akun? <Link href="/auth/register">Daftar sekarang</Link>
          </div>
        </div>
      </div>
    </main>
  );
}