const fs = require('fs');
const path = './prisma/schema.prisma';
let code = fs.readFileSync(path, 'utf8');

// Add relation to User model
code = code.replace(
  "kesalahanTeller    RekapKesalahanTeller[]\n}",
  "kesalahanTeller    RekapKesalahanTeller[]\n  performaKaryawan   PerformaKaryawan[]\n}"
);

const newModel = `
model PerformaKaryawan {
  id        Int      @id @default(autoincrement())
  userId    Int
  user      User     @relation(fields: [userId], references: [id])
  tanggal   DateTime @db.Date
  kegiatan  String   @db.Text
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([userId, tanggal])
}
`;

fs.writeFileSync(path, code + "\n" + newModel);
console.log('Schema patched for PerformaKaryawan');
