const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 3) {
    console.log('Cara pakai: node scripts/create-superadmin.js <username> <password> <"Nama Lengkap">');
    process.exit(1);
  }

  const [username, password, nama] = args;

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    console.log('Username sudah dipakai. Coba username lain.');
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      nama,
      username,
      passwordHash,
      role: 'SUPERADMIN',
      status: 'APPROVED',
    },
  });

  console.log('Superadmin berhasil dibuat:');
  console.log(`  Nama     : ${user.nama}`);
  console.log(`  Username : ${user.username}`);
  console.log(`  Role     : ${user.role}`);
  console.log(`  Status   : ${user.status}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });