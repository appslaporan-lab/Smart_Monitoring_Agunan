import { redirect } from 'next/navigation';

export default function PerformaPage() {
  redirect('/performa/kolektibilitas');
}
        <h1>Modul Performa Kantor</h1>
        <p style={{ color: '#64748b' }}>Modul ini sedang dalam pengembangan. Segera hadir.</p>
        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
          <Link href="/performa/kolektibilitas" className="button secondary">Laporan Kolektibilitas</Link>
          <Link href="/collecting/upload" className="button">Kelola Upload Nominatif</Link>
        </div>
      </div>
    </main>
  );
}