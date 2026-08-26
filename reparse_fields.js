const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const toNumber = (val) => {
  if (val === null || val === undefined || val === '') return null;
  const num = typeof val === 'number' ? val : parseFloat(String(val).replace(/,/g, ''));
  return isNaN(num) ? null : num;
};

const toDate = (val) => {
  if (!val) return null;
  if (val instanceof Date) return val;
  if (typeof val === 'string') {
    const match = val.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (match) {
      return new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]));
    }
  }
  const parsed = new Date(val);
  return isNaN(parsed.getTime()) ? null : parsed;
};

async function main() {
  const pinjamans = await prisma.pinjamanPeriode.findMany({
    select: { id: true, rawDataJson: true }
  });

  let updated = 0;
  for (const p of pinjamans) {
    if (!p.rawDataJson) continue;
    try {
      const row = JSON.parse(p.rawDataJson);
      
      const newTunggakanBunga = toNumber(row['X']);
      // For angsuranPerBulan, if AA is 0, let's look for other columns that might represent it.
      // E.g., Y? AB? Let's default to AA, but if AA is 0, we can just leave it as 0. 
      // Actually, if AA is 0, CBS just exported it as 0. 
      const newAngsuranPerBulan = toNumber(row['AA']); 
      const newTglJatuhTempo = toDate(row['AD']);
      const newTglRealisasi = toDate(row['AC']);

      await prisma.pinjamanPeriode.update({
        where: { id: p.id },
        data: {
          tunggakanBunga: newTunggakanBunga,
          angsuranPerBulan: newAngsuranPerBulan,
          tglJatuhTempo: newTglJatuhTempo,
          tglRealisasi: newTglRealisasi
        }
      });
      updated++;
    } catch (e) {
      console.error('Error on id', p.id, e.message);
    }
  }
  console.log(`Finished updating ${updated} records`);
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
