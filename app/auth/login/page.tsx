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