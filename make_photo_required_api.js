const fs = require('fs');

const filePath = 'app/api/collecting/kunjungan/route.ts';
let code = fs.readFileSync(filePath, 'utf8');

const oldCheck = `if (!pinjamanPeriodeId || !tanggalKunjungan || !jenisKontak || !hasil) {
    return NextResponse.json({ error: 'Data tidak lengkap.' }, { status: 400 });
  }`;

const newCheck = `if (!pinjamanPeriodeId || !tanggalKunjungan || !jenisKontak || !hasil) {
    return NextResponse.json({ error: 'Data tidak lengkap.' }, { status: 400 });
  }
  if (!fotoDataUrl) {
    return NextResponse.json({ error: 'Foto dokumentasi wajib dilampirkan.' }, { status: 400 });
  }`;

if (code.includes(oldCheck)) {
  code = code.replace(oldCheck, newCheck);
  fs.writeFileSync(filePath, code);
  console.log('Made photo mandatory in API');
} else {
  console.log('Could not find check in API');
}
