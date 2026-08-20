const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const data = await prisma.pinjamanPeriode.findMany({ take: 10, select: { sukuBunga: true, produkKredit: true, rawDataJson: true } });
  console.log(data.map(d => ({
    sukuBunga: d.sukuBunga,
    produkKredit: d.produkKredit,
    rawSukuBunga: JSON.parse(d.rawDataJson)['T'] || null,
    rawProduk: JSON.parse(d.rawDataJson)['C'] || null
  })));
}

check();
