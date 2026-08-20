import SettingsForm from './SettingsForm';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Pengaturan Bucket',
};

export default function SettingsPage() {
  return (
    <main className="container" style={{ paddingTop: 24 }}>
      <section style={{ marginBottom: 32 }}>
        <h1>Pengaturan Bucket & Kriteria</h1>
        <p>Sesuaikan rentang nilai (bucket) untuk laporan dashboard dan performa kantor.</p>
      </section>
      
      <SettingsForm />
    </main>
  );
}
