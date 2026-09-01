const fs = require('fs');
let code = fs.readFileSync('app/collecting/CollectingDebiturList.tsx', 'utf8');

// 1. Add currentPage state
code = code.replace("const [activeFilter, setActiveFilter] = useState('ALL');", "const [activeFilter, setActiveFilter] = useState('ALL');\n  const [currentPage, setCurrentPage] = useState(1);");

// 2. Reset currentPage on search or filter change
code = code.replace("onChange={(e) => setQuery(e.target.value)}", "onChange={(e) => { setQuery(e.target.value); setCurrentPage(1); }}");
code = code.replace("onClick={() => setActiveFilter(key)}", "onClick={() => { setActiveFilter(key); setCurrentPage(1); }}");

// 3. Add pagination logic
const renderReplaceOld = `filtered.map((item) => (`;
const renderReplaceNew = `filtered.slice((currentPage - 1) * 50, currentPage * 50).map((item) => (`;
code = code.replace(renderReplaceOld, renderReplaceNew);

// 4. Add pagination UI at the end of the list
const listEnd = `</article>\n              ))\n            )}\n          </div>`;
const paginationUI = `</article>\n              ))\n            )}\n          </div>\n          \n          {filtered.length > 50 && (\n            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, marginTop: 24 }}>\n              <button className="button secondary" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Sebelumnya</button>\n              <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Halaman {currentPage} dari {Math.ceil(filtered.length / 50)}</span>\n              <button className="button secondary" disabled={currentPage === Math.ceil(filtered.length / 50)} onClick={() => setCurrentPage(p => p + 1)}>Selanjutnya</button>\n            </div>\n          )}`;

code = code.replace(listEnd, paginationUI);
fs.writeFileSync('app/collecting/CollectingDebiturList.tsx', code);
console.log('Added pagination');
