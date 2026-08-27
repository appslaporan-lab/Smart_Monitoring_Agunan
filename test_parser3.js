const activeNoreks = new Set(['1311008403']);
const data = [
  ['00C9A810', '1303000114', 'ELMI YUNIARTI', 'BAYAR ANGSURAN PINJAMAN', 812500, 0, 'FAATIH'],
  ['', '', '', 'NOREK 1311008403', '', '', '']
];

for (let i = 0; i < data.length; i++) {
  const row = data[i];
  const rowStr = row.join(' ').toLowerCase();
  const norekMatches = rowStr.match(/\b\d{10}\b/g);
  
  if (norekMatches) {
    const validNorek = norekMatches.find(n => activeNoreks.has(n));
    if (validNorek) {
      let maxCurrent = 0;
      for (const val of row) {
        if (typeof val === 'number' && val > maxCurrent) maxCurrent = val;
      }
      
      let maxPrev = 0;
      if (i > 0) {
        for (const val of data[i-1]) {
          if (typeof val === 'number' && val > maxPrev) maxPrev = val;
        }
      }
      
      console.log('Found', validNorek, 'Nominal', Math.max(maxCurrent, maxPrev));
    }
  }
}
