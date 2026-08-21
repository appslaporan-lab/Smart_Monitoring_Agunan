const fs = require('fs');
let code = fs.readFileSync('app/performa/kolektibilitas/page.tsx', 'utf8');

code = code.replace(/<table style={{ width: '100%', borderCollapse: 'collapse' }}>[\s\S]*?<\/thead>/, 
`<table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th rowSpan={3} style={{ padding: '4px 8px', border: '1px solid #000', backgroundColor: '#e2e8f0' }}>KANTOR</th>
              <th colSpan={10} style={{ padding: '4px 8px', border: '1px solid #000', backgroundColor: '#e2e8f0' }}>KOLEKTIBILITAS</th>
              <th colSpan={2} style={{ padding: '4px 8px', border: '1px solid #000', backgroundColor: '#86efac' }}>NON NPL</th>
              <th colSpan={2} style={{ padding: '4px 8px', border: '1px solid #000', backgroundColor: '#fca5a5' }}>NPL</th>
              <th rowSpan={3} style={{ padding: '4px 8px', border: '1px solid #000', backgroundColor: '#e2e8f0' }}>Total NOA</th>
              <th rowSpan={3} style={{ padding: '4px 8px', border: '1px solid #000', backgroundColor: '#e2e8f0' }}>Total OS</th>
              <th rowSpan={3} style={{ padding: '4px 8px', border: '1px solid #000', backgroundColor: '#fef08a' }}>% NPL</th>
            </tr>
            <tr style={{ backgroundColor: '#e2e8f0' }}>
              <th colSpan={2} style={{ border: '1px solid #000' }}>1</th>
              <th colSpan={2} style={{ border: '1px solid #000' }}>2</th>
              <th colSpan={2} style={{ border: '1px solid #000' }}>3</th>
              <th colSpan={2} style={{ border: '1px solid #000' }}>4</th>
              <th colSpan={2} style={{ border: '1px solid #000' }}>5</th>
              <th colSpan={2} style={{ border: '1px solid #000', backgroundColor: '#86efac' }}></th>
              <th colSpan={2} style={{ border: '1px solid #000', backgroundColor: '#fca5a5' }}></th>
            </tr>
            <tr style={{ backgroundColor: '#e2e8f0' }}>
              <th style={{ border: '1px solid #000', padding: '4px' }}>NOA</th><th style={{ border: '1px solid #000', padding: '4px' }}>OS</th>
              <th style={{ border: '1px solid #000', padding: '4px' }}>NOA</th><th style={{ border: '1px solid #000', padding: '4px' }}>OS</th>
              <th style={{ border: '1px solid #000', padding: '4px' }}>NOA</th><th style={{ border: '1px solid #000', padding: '4px' }}>OS</th>
              <th style={{ border: '1px solid #000', padding: '4px' }}>NOA</th><th style={{ border: '1px solid #000', padding: '4px' }}>OS</th>
              <th style={{ border: '1px solid #000', padding: '4px' }}>NOA</th><th style={{ border: '1px solid #000', padding: '4px' }}>OS</th>
              <th style={{ border: '1px solid #000', padding: '4px', backgroundColor: '#86efac' }}>NOA</th><th style={{ border: '1px solid #000', padding: '4px', backgroundColor: '#86efac' }}>OS</th>
              <th style={{ border: '1px solid #000', padding: '4px', backgroundColor: '#fca5a5' }}>NOA</th><th style={{ border: '1px solid #000', padding: '4px', backgroundColor: '#fca5a5' }}>OS</th>
            </tr>
          </thead>`
);
fs.writeFileSync('app/performa/kolektibilitas/page.tsx', code);
console.log('Fixed header');
