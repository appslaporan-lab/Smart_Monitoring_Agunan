const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

async function main() {
  const prisma = new PrismaClient();
  await prisma.performaKaryawan.deleteMany({});
  console.log('Cleared existing records.');
  
  const path = './prisma/schema.prisma';
  let code = fs.readFileSync(path, 'utf8');

  // Change unique constraint and type
  code = code.replace(
    /kegiatan\s+String\s+@db\.Text/,
    "kegiatan       String"
  );
  
  code = code.replace(
    /@@unique\(\[userId, tanggal\]\)/,
    "@@unique([userId, tanggal, kegiatan])"
  );

  fs.writeFileSync(path, code);
  console.log('Schema patched.');
}

main().catch(console.error);
