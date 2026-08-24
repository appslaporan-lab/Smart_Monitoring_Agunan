const fs = require('fs');
let code = fs.readFileSync('app/superadmin/users/UserActions.tsx', 'utf8');

// Add Trash2 icon
if (!code.includes('Trash2')) {
  code = code.replace("import { useState } from 'react';", "import { useState } from 'react';\nimport { Trash2 } from 'lucide-react';");
}

// Add handleDelete function
const deleteFunc = `
  const handleDelete = async () => {
    const confirmed = window.confirm(\`PERINGATAN! Yakin ingin menghapus user \${userName} (\${username})? Semua data terkait (bila ada) bisa ikut terhapus atau menyebabkan error jika ada transaksi.\`);
    if (!confirmed) return;

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch(\`/api/superadmin/users/\${userId}\`, {
        method: 'DELETE',
      });

      const result = await res.json();
      if (!res.ok) {
        setMessage(result.error || 'Gagal menghapus user.');
        setLoading(false);
        return;
      }

      window.alert(\`User \${username} berhasil dihapus.\`);
      router.refresh();
    } catch {
      setMessage('Terjadi kesalahan saat menghapus user.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
`;

code = code.replace("  const handleResetPassword = async () => {", deleteFunc);

// Add the delete button to the UI
const ui = `
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          type="button"
          className="button secondary"
          disabled={loading}
          onClick={handleResetPassword}
        >
          {loading ? 'Memproses...' : 'Reset Password'}
        </button>
        <button
          type="button"
          style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
          disabled={loading}
          onClick={handleDelete}
        >
          <Trash2 size={16} /> Hapus
        </button>
      </div>
`;

code = code.replace(
  `      <button
        type="button"
        className="button secondary"
        disabled={loading}
        onClick={handleResetPassword}
      >
        {loading ? 'Memproses...' : 'Reset Password'}
      </button>`, ui);

fs.writeFileSync('app/superadmin/users/UserActions.tsx', code);
console.log('Delete button added');
