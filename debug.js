const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const p = await prisma.periodeNominatif.findFirst({ orderBy: { id: 'desc' } });
  if (!p) return console.log('no periode');
  const rows = await prisma.pinjamanPeriode.findMany({ take: 5, where: { periodeId: p.id }, select: { subKantor: true, kdKolektibilitas: true, outstanding: true } });
  console.log(rows);
}
main();
