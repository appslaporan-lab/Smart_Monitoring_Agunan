const fs = require('fs');
const { Client } = require('pg');

const env = fs.readFileSync('.env', 'utf8');
const dbUrl = env.split('\n').find(l => l.startsWith('DATABASE_URL')).split('=')[1].replace(/'/g, '').replace(/"/g, '').trim();

const client = new Client({ connectionString: dbUrl });

async function main() {
    await client.connect();
    const res = await client.query('SELECT id, "rawDataJson" FROM "PinjamanPeriode" WHERE "rawDataJson" IS NOT NULL');
    let updated = 0;
    for (const r of res.rows) {
        try {
            const raw = JSON.parse(r.rawDataJson);
            const norek = raw['BC'] ? String(raw['BC']).trim() : null;
            let saldo = null;
            if (raw['BD'] !== undefined && raw['BD'] !== null) {
                const num = typeof raw['BD'] === 'number' ? raw['BD'] : parseFloat(String(raw['BD']).replace(/,/g, ''));
                if (!isNaN(num)) saldo = num;
            }
            if (norek || saldo !== null) {
                await client.query('UPDATE "PinjamanPeriode" SET "norekTabungan" = $1, "saldoTabungan" = $2 WHERE id = $3', [norek, saldo, r.id]);
                updated++;
            }
        } catch(e) {}
    }
    console.log('Backfilled:', updated);
    await client.end();
}
main();
