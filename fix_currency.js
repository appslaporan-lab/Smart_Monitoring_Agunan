const fs = require('fs');
let code = fs.readFileSync('app/kpi/mo-realisasi/input/page.tsx', 'utf8');

if (!code.includes('CurrencyInput')) {
  code = code.replace("import Link from 'next/link';", "import Link from 'next/link';\nimport CurrencyInput from '@/components/CurrencyInput';");

  const oldInputRealisasi = `<input 
                type="number" 
                className="inputField" 
                value={nominalRealisasi} 
                onChange={e => setNominalRealisasi(e.target.value)} 
                placeholder="Contoh: 150000000"
                required 
              />`;
  
  const newInputRealisasi = `<CurrencyInput 
                value={nominalRealisasi} 
                onChange={setNominalRealisasi} 
                placeholder="Rp 0"
                required 
              />`;
              
  const oldInputSaldo = `<input 
                  type="number" 
                  className="inputField" 
                  value={saldoAkhir} 
                  onChange={e => setSaldoAkhir(e.target.value)} 
                  placeholder="Contoh: 50000000"
                  required={jenis === 'TOP_UP'}
                />`;

  const newInputSaldo = `<CurrencyInput 
                  value={saldoAkhir} 
                  onChange={setSaldoAkhir} 
                  placeholder="Rp 0"
                  required={jenis === 'TOP_UP'}
                />`;

  code = code.replace(oldInputRealisasi, newInputRealisasi);
  code = code.replace(oldInputSaldo, newInputSaldo);

  // also replace toast logic
  if (!code.includes('toast.success')) {
    code = code.replace("import Link from 'next/link';\nimport CurrencyInput", "import Link from 'next/link';\nimport CurrencyInput from '@/components/CurrencyInput';\nimport toast from 'react-hot-toast';\n//");
    code = code.replace("setSuccess(`Data realisasi harian berhasil disimpan! Pencapaian KPI yang tercatat: ${formatCurrency(net)}`);", "toast.success(`Berhasil! Pencapaian KPI tercatat: ${formatCurrency(net)}`);");
    code = code.replace("setError(err.message);", "toast.error(err.message);");
    code = code.replace("setError('Nominal realisasi tidak valid');", "toast.error('Nominal realisasi tidak valid');");
    code = code.replace("setError('Nominal pencapaian KPI tidak boleh minus (Saldo Akhir lebih besar dari Realisasi).');", "toast.error('KPI tidak boleh minus (Saldo Akhir > Realisasi).');");
  }

  fs.writeFileSync('app/kpi/mo-realisasi/input/page.tsx', code);
  console.log('Currency Input applied to MO Realisasi');
}
