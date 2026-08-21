import Link from 'next/link';
import { Shield } from 'lucide-react';
import { generateCaptcha } from '@/lib/captcha';

type LoginPageProps = {
  searchParams?: { error?: string; success?: string };
};

export default function LoginPage({ searchParams }: LoginPageProps) {
  const captcha = generateCaptcha();

  return (
    <main className="login-layout">
      <div className="login-graphic">
        <div className="login-graphic-content">
          <div className="login-graphic-logo" style={{ background: 'transparent', padding: 0, boxShadow: 'none', width: 'auto', height: 'auto', display: 'inline-block' }}>
              <img src="/logo-bpr-resmi.png" alt="Logo BPR" style={{ width: '320px', height: 'auto', objectFit: 'contain' }} />
            </div>
          <h1>Selamat Datang Kembali</h1>
          <p>
            Sistem informasi terpadu untuk analisis performa Kolektibilitas, manajemen aktivitas Penagihan (Collecting), penilaian KPI, serta monitoring Agunan kredit secara komprehensif dan real-time.
          </p>
        </div>
      </div>

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

            <div className="login-form-group">
              <label className="label">Verifikasi: Berapa {captcha.question} ?</label>
              <input type="text" name="captchaAnswer" className="inputField" placeholder="Jawaban" required inputMode="numeric" />
              <input type="hidden" name="captchaToken" value={captcha.token} />
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