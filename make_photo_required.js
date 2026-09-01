const fs = require('fs');

const filePath = 'app/collecting/pinjaman/[id]/KunjunganForm.tsx';
let code = fs.readFileSync(filePath, 'utf8');

// 1. Update Label
code = code.replace(
  '<label className="label">Foto Dokumentasi (opsional)</label>',
  '<label className="label">Foto Dokumentasi (Wajib)</label>'
);

// 2. Add required to input
code = code.replace(
  '<input className="inputField" type="file" accept="image/*" capture="environment" onChange={handlePhotoChange} />',
  '<input className="inputField" type="file" accept="image/*" capture="environment" required onChange={handlePhotoChange} />'
);

// 3. Add check in handleSubmit
const oldSubmitCheck = `if (!hasil) {
      setStatusMessage('Pilih hasil kunjungan terlebih dahulu.');
      return;
    }`;

const newSubmitCheck = `if (!hasil) {
      setStatusMessage('Pilih hasil kunjungan terlebih dahulu.');
      return;
    }
    if (!fotoDataUrl) {
      setStatusMessage('Foto dokumentasi wajib diunggah untuk menyimpan laporan.');
      return;
    }`;

if (code.includes(oldSubmitCheck)) {
  code = code.replace(oldSubmitCheck, newSubmitCheck);
}

fs.writeFileSync(filePath, code);
console.log('Made photo mandatory');
