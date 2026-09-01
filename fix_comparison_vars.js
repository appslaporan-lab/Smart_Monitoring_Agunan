const fs = require('fs');

let code = fs.readFileSync('app/performa/kolektibilitas/page.tsx', 'utf8');

const targetStr = `rows = rows.filter(r => canAccessKantorData(user.role, user.kantor, user.subKantor, r.subKantor));

  const matrixRadiusRanges = [`;

const insertStr = `rows = rows.filter(r => canAccessKantorData(user.role, user.kantor, user.subKantor, r.subKantor));

  const activeIndex = semuaPeriode.findIndex(p => p.id === periodeAktif.id);
  const periodeSebelumnya = semuaPeriode[activeIndex + 1];

  let prevRows: typeof rows = [];
  if (periodeSebelumnya) {
    prevRows = await prisma.pinjamanPeriode.findMany({
      where: { periodeId: periodeSebelumnya.id },
    });
    prevRows = prevRows.filter(r => canAccessKantorData(user.role, user.kantor, user.subKantor, r.subKantor));
  }

  function aggregateKolektibilitas(dataRows: typeof rows) {
    const stats = {
      total: { noa: 0, os: 0 },
      k1: { noa: 0, os: 0 },
      k2: { noa: 0, os: 0 },
      k3: { noa: 0, os: 0 },
      k4: { noa: 0, os: 0 },
      k5: { noa: 0, os: 0 },
    };
    for (const r of dataRows) {
      stats.total.noa++;
      stats.total.os += r.outstanding;
      if (r.kdKolektibilitas === '1') { stats.k1.noa++; stats.k1.os += r.outstanding; }
      else if (r.kdKolektibilitas === '2') { stats.k2.noa++; stats.k2.os += r.outstanding; }
      else if (r.kdKolektibilitas === '3') { stats.k3.noa++; stats.k3.os += r.outstanding; }
      else if (r.kdKolektibilitas === '4') { stats.k4.noa++; stats.k4.os += r.outstanding; }
      else if (r.kdKolektibilitas === '5' || r.kdKolektibilitas === '6') { stats.k5.noa++; stats.k5.os += r.outstanding; }
    }
    return stats;
  }

  const currentStats = aggregateKolektibilitas(rows);
  const prevStats = aggregateKolektibilitas(prevRows);

  const matrixRadiusRanges = [`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, insertStr);
  fs.writeFileSync('app/performa/kolektibilitas/page.tsx', code);
  console.log('Fixed undefined variables by inserting calculations');
} else {
  console.log('Target string not found');
}
