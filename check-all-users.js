const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.user.findMany({ select: { nama: true, username: true, role: true } }).then((r) => {
  r.forEach((u) => console.log(u.nama, '-', u.username, '-', u.role));
  p.$disconnect();
}).catch((e) => {
  console.error('ERROR:', e.message);
});