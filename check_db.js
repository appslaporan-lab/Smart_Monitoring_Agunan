const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const p = await prisma.pinjamanPeriode.findFirst({
    where: { norek: '0516007079' }
  });
  console.log('Tunggakan Bunga DB:', p.tunggakanBunga);
  console.log('Angsuran Per Bulan DB:', p.angsuranPerBulan);
  console.log('Tgl Jatuh Tempo DB:', p.tglJatuhTempo);
}
main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
