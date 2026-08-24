const fs = require('fs');
const path = './prisma/schema.prisma';
let code = fs.readFileSync(path, 'utf8');

// Add relation to User model
code = code.replace(
  "performaKaryawan   PerformaKaryawan[]\n}",
  "performaKaryawan   PerformaKaryawan[]\n  realisasiMo        RealisasiHarianMO[]\n}"
);

const newModel = `
model RealisasiHarianMO {
  id        Int      @id @default(autoincrement())
  userId    Int
  user      User     @relation(fields: [userId], references: [id])
  tanggal   DateTime @db.Date
  nominal   Float    @default(0)
  keterangan String? @db.Text
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
`;

fs.writeFileSync(path, code + "\n" + newModel);
console.log('Schema patched for RealisasiHarianMO');
