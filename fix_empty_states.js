const fs = require('fs');

let colCode = fs.readFileSync('app/collecting/page.tsx', 'utf8');
if (!colCode.includes('EmptyState')) {
  colCode = colCode.replace("import Link from 'next/link';", "import Link from 'next/link';\nimport EmptyState from '@/components/EmptyState';");
  const oldEmpty = `<section style={{ marginBottom: 32 }}>
          <h1>Dashboard Collecting Kredit</h1>
          <p>Belum ada data nominatif yang diupload.</p>
        </section>
        {user.role === 'SUPERADMIN' && (
          <Link href="/collecting/upload" className="button">Upload Nominatif Sekarang</Link>
        )}`;
  
  const newEmpty = `<section style={{ marginBottom: 32 }}>
          <h1>Dashboard Collecting Kredit</h1>
        </section>
        <EmptyState 
          title="Belum ada data nominatif" 
          description="Silakan upload data nominatif collecting terlebih dahulu untuk melihat dashboard pemantauan debitur."
          actionLabel={user.role === 'SUPERADMIN' ? "Upload Nominatif Sekarang" : undefined}
          actionHref={user.role === 'SUPERADMIN' ? "/collecting/upload" : undefined}
        />`;
  colCode = colCode.replace(oldEmpty, newEmpty);
  fs.writeFileSync('app/collecting/page.tsx', colCode);
}

let kpiCode = fs.readFileSync('app/kpi/mo-realisasi/page.tsx', 'utf8');
if (!kpiCode.includes('EmptyState')) {
  kpiCode = kpiCode.replace("import Link from 'next/link';", "import Link from 'next/link';\nimport EmptyState from '@/components/EmptyState';");
  
  const oldEmpty1 = `<p style={{ color: '#64748b', textAlign: 'center', padding: 20 }}>Belum ada input realisasi MO bulan ini.</p>`;
  const newEmpty1 = `<EmptyState title="Belum ada realisasi" description="Belum ada input realisasi MO pada bulan ini." />`;
  
  const oldEmpty2 = `<p style={{ color: '#64748b', textAlign: 'center', padding: 20 }}>Belum ada data rekonsiliasi.</p>`;
  const newEmpty2 = `<EmptyState title="Belum ada rekonsiliasi" description="Data perbandingan Teller vs MO kosong." />`;

  kpiCode = kpiCode.replace(oldEmpty1, newEmpty1);
  kpiCode = kpiCode.replace(oldEmpty2, newEmpty2);
  fs.writeFileSync('app/kpi/mo-realisasi/page.tsx', kpiCode);
}

console.log('Empty states applied');
