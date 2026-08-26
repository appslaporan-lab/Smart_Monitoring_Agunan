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
    select: { id: true, rawDataJson: true },
    where: { rawDataJson: { not: null }, periodeId: 7 } // Just fix period 7 first!
  });

  console.log('Total records to process for Period 7:', pinjamans.length);

  const batchSize = 100;
  for (let i = 0; i < pinjamans.length; i += batchSize) {
    const batch = pinjamans.slice(i, i + batchSize);
    
    await Promise.all(batch.map(async p => {
      try {
        const row = JSON.parse(p.rawDataJson);
        const newTunggakanBunga = toNumber(row['X']);
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
      } catch (err) {}
    }));
    console.log(`Processed up to ${i + batch.length}`);
  }
  console.log('Finished updating records');
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
