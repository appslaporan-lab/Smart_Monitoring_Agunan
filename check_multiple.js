const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const pList = await prisma.pinjamanPeriode.findMany({
    where: { norek: '0516007079' }
  });
  pList.forEach(p => {
    console.log(`ID: ${p.id}, PeriodeId: ${p.periodeId}, Tunggakan Bunga: ${p.tunggakanBunga}, Tgl Jatuh Tempo: ${p.tglJatuhTempo}`);
  });
}
main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
