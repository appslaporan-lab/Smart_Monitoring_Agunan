const fs = require('fs');
const path = './prisma/schema.prisma';
let code = fs.readFileSync(path, 'utf8');

// Also add relation to User model
code = code.replace(
  "diuploadOleh    PeriodeNominatif[]",
  "diuploadOleh    PeriodeNominatif[]\n  kesalahanTeller RekapKesalahanTeller[]"
);

const newModel = `
model RekapKesalahanTeller {
  id        Int      @id @default(autoincrement())
  userId    Int
  user      User     @relation(fields: [userId], references: [id])
  tanggal   DateTime @db.Date
  jumlah    Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([userId, tanggal])
}
`;
fs.writeFileSync(path, code + "\n" + newModel);
console.log('Schema patched');
