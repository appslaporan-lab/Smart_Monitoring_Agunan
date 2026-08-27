const activeNoreks = new Set(['1311008403']);
const data = [
  ['00C9A810', '1303000114', 'ELMI YUNIARTI', 'BAYAR ANGSURAN PINJAMAN', 812500, 0, 'FAATIH'],
  ['', '', '', 'NOREK 1311008403', '', '', '']
];

for (let i = 0; i < data.length; i++) {
  const row = data[i];
  const rowStr = row.join(' ').toLowerCase();
  const norekMatches = rowStr.match(/\\b\\d{10}\\b/g);
  console.log('Row', i, rowStr, norekMatches);
  if (norekMatches) {
    const validNorek = norekMatches.find(n => activeNoreks.has(n));
    console.log('validNorek', validNorek);
  }
}
