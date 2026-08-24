const fs = require('fs');
const path = './prisma/schema.prisma';
let code = fs.readFileSync(path, 'utf8');

const oldModel = `model RealisasiHarianMO {
  id        Int      @id @default(autoincrement())
  userId    Int
  user      User     @relation(fields: [userId], references: [id])
  tanggal   DateTime @db.Date
  nominal   Float    @default(0)
  keterangan String? @db.Text
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}`;

const newModel = `model RealisasiHarianMO {
  id           Int      @id @default(autoincrement())
  userId       Int
  user         User     @relation(fields: [userId], references: [id])
  tanggal      DateTime @db.Date
  nominal      Float    @default(0)
  jenis        String   @default("BARU")
  saldoAkhir   Float    @default(0)
  nominalAsli  Float    @default(0)
  keterangan   String?  @db.Text
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}`;

code = code.replace(oldModel, newModel);

fs.writeFileSync(path, code);
console.log('Schema patched for topup');
