const fs = require('fs');
const path = './prisma/schema.prisma';
let code = fs.readFileSync(path, 'utf8');

// Replace the PerformaKaryawan model
code = code.replace(
  /model PerformaKaryawan \{[\s\S]*?\}/,
  `model PerformaKaryawan {
  id             Int      @id @default(autoincrement())
  userId         Int
  user           User     @relation(fields: [userId], references: [id])
  tanggal        DateTime @db.Date
  kegiatan       String   @db.Text
  jumlahKegiatan Int      @default(0)
  nominal        Float    @default(0)
  kesalahan      Int      @default(0)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@unique([userId, tanggal])
}`
);

fs.writeFileSync(path, code);
console.log('Schema patched for new PerformaKaryawan columns');
