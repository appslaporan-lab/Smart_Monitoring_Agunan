const fs = require('fs');

// 1. UserActions
let code = fs.readFileSync('app/superadmin/users/UserActions.tsx', 'utf8');
if (!code.includes('react-hot-toast')) {
  code = code.replace("import { useRouter } from 'next/navigation';", "import { useRouter } from 'next/navigation';\nimport toast from 'react-hot-toast';");
  code = code.replace(/window\.alert\([^)]+\)/g, (match) => match.replace("window.alert", "toast.success"));
  code = code.replace(/setMessage\([^)]+\)/g, (match) => {
    if (match.includes("Gagal") || match.includes("Terjadi")) {
      return match.replace("setMessage", "toast.error");
    }
    return match;
  });
  code = code.replace("{message && <div className=\"alert alert-info\" style={{ padding: '6px 10px', fontSize: '0.9rem' }}>{message}</div>}", "");
  fs.writeFileSync('app/superadmin/users/UserActions.tsx', code);
}

// 2. SuperadminManageRealisasi
let code2 = fs.readFileSync('components/SuperadminManageRealisasi.tsx', 'utf8');
if (!code2.includes('react-hot-toast')) {
  code2 = code2.replace("import { useRouter } from 'next/navigation';", "import { useRouter } from 'next/navigation';\nimport toast from 'react-hot-toast';");
  code2 = code2.replace(/alert\('Gagal menyimpan data'\)/g, "toast.error('Gagal menyimpan data')");
  code2 = code2.replace(/alert\('Error saving data'\)/g, "toast.error('Terjadi kesalahan')");
  code2 = code2.replace(/alert\('Gagal menghapus data'\)/g, "toast.error('Gagal menghapus data')");
  code2 = code2.replace(/alert\('Error deleting data'\)/g, "toast.error('Terjadi kesalahan')");
  code2 = code2.replace("setEditingId(null);\n        router.refresh();", "toast.success('Berhasil disimpan');\n        setEditingId(null);\n        router.refresh();");
  code2 = code2.replace("if (res.ok) {\n        router.refresh();", "if (res.ok) {\n        toast.success('Berhasil dihapus');\n        router.refresh();");
  fs.writeFileSync('components/SuperadminManageRealisasi.tsx', code2);
}

console.log('Toasts added');
