const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  for (const user of users) {
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: 'Pusat Notifikasi Aktif!',
        message: 'Selamat datang di pembaruan sistem terbaru. Kini Anda dapat menerima pemberitahuan otomatis di sini.',
        isRead: false
      }
    });
  }
  console.log('Test notification sent to all users');
}
main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
