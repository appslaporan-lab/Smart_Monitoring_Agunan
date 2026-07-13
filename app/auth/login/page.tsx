import Link from 'next/link';

type LoginPageProps = {
  searchParams?: { error?: string; success?: string };
};

export default function LoginPage({ searchParams }: LoginPageProps) {
  return (
    <main className="container">
      <section style={{ marginBottom: 32 }}>
        <h1>Login</h1>
        <p>Masuk ke sistem monitoring agunan.</p>
      </section>

      <div className="card" style={{ padding: 24 }}>
        {searchParams?.error && <div className="alert alert-danger">{searchParams.error}</div>}
        {searchParams?.success && <div className="alert alert-info">{searchParams.success}</div>}
        <form method="post" action="/auth/login/api">
          <div style={{ display: 'grid', gap: 16 }}>
            <div>
              <label className="label">Email</label>
              <input type="email" name="email" className="inputField" required />
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" name="password" className="inputField" required />
            </div>
            <button type="submit" className="button">Login</button>
          </div>
        </form>

        <p style={{ marginTop: 18 }}>
          Belum punya akun? <Link href="/auth/register">Register</Link>
        </p>
      </div>
    </main>
  );
}
