const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const p = await prisma.periodeNominatif.findFirst({ orderBy: { id: 'desc' } });
  if (!p) return console.log('no periode');
  const rows = await prisma.pinjamanPeriode.findMany({ where: { periodeId: p.id }, select: { rawDataJson: true } });
  
  const kecamats = new Set();
  for (const r of rows) {
    if (r.rawDataJson) {
      const parsed = JSON.parse(r.rawDataJson);
      const k = parsed['K'];
      if (k) kecamats.add(k.trim().toUpperCase());
    }
  }
  console.log(Array.from(kecamats));
}
main();
