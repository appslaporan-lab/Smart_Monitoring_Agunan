'use client';

import Link from 'next/link';
import { useState } from 'react';

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
  { value: 'SPI', label: 'SPI' },
  { value: 'TELLER', label: 'Teller' },
  { value: 'MO', label: 'MO (Marketing Officer)' },
  { value: 'KASUBAG_REMEDIAL', label: 'Kasubag Remedial' },
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
  { value: 'SEMUA_KANTOR', label: 'Semua Kantor' },
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
  { value: 'SEMUA_KANTOR', label: 'Semua Sub Kantor' },
];

const ALL_OFFICE_ROLES = [
  'KASUBAG_REMEDIAL',
  'KABAG_OPERASIONAL',
  'KABAG_MARKETING_PUSAT_1',
  'KABAG_MARKETING_PUSAT_2',
  'DIREKTUR'
];

export default function RegisterPage({ searchParams }: RegisterPageProps) {
  const [selectedRole, setSelectedRole] = useState('');

  const isAllOfficeRole = ALL_OFFICE_ROLES.includes(selectedRole);

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
              <label className="label">Role</label>
              <select 
                name="role" 
                className="inputField" 
                required 
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                <option value="">PILIH ROLE</option>
                {roles.map((role) => (
                  <option key={role.value} value={role.value}>{role.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Kantor</label>
              {isAllOfficeRole ? (
                <>
                  <input type="hidden" name="kantor" value="SEMUA_KANTOR" />
                  <select className="inputField" disabled value="SEMUA_KANTOR">
                    {kantorOptions.map((kantor) => (
                      <option key={kantor.value} value={kantor.value}>{kantor.label}</option>
                    ))}
                  </select>
                </>
              ) : (
                <select name="kantor" className="inputField" required>
                  <option value="">PILIH KANTOR</option>
                  {kantorOptions.filter(k => k.value !== 'SEMUA_KANTOR').map((kantor) => (
                    <option key={kantor.value} value={kantor.value}>{kantor.label}</option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <label className="label">Sub Kantor</label>
              {isAllOfficeRole ? (
                <>
                  <input type="hidden" name="subKantor" value="SEMUA_KANTOR" />
                  <select className="inputField" disabled value="SEMUA_KANTOR">
                    {subKantorOptions.map((subKantor) => (
                      <option key={subKantor.value} value={subKantor.value}>{subKantor.label}</option>
                    ))}
                  </select>
                </>
              ) : (
                <select name="subKantor" className="inputField" required>
                  <option value="">PILIH SUB KANTOR</option>
                  {subKantorOptions.filter(s => s.value !== 'SEMUA_KANTOR').map((subKantor) => (
                    <option key={subKantor.value} value={subKantor.value}>{subKantor.label}</option>
                  ))}
                </select>
              )}
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