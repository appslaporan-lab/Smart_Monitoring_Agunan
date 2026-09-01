const fs = require('fs');
let code = fs.readFileSync('app/collecting/CollectingDebiturList.tsx', 'utf8');

const oldStr = `              </article>
            ))
          )}
        </div>
      </section>`;

const newStr = `              </article>
            ))
          )}
          {filtered.length > 50 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
              <button 
                type="button" 
                className="button secondary" 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              >
                Sebelumnya
              </button>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Halaman {currentPage} dari {Math.ceil(filtered.length / 50)}
              </span>
              <button 
                type="button" 
                className="button secondary"
                disabled={currentPage === Math.ceil(filtered.length / 50)}
                onClick={() => setCurrentPage(p => p + 1)}
              >
                Selanjutnya
              </button>
            </div>
          )}
        </div>
      </section>`;

if (code.includes(oldStr)) {
  code = code.replace(oldStr, newStr);
  fs.writeFileSync('app/collecting/CollectingDebiturList.tsx', code);
  console.log('Added pagination controls');
} else {
  console.log('Target string not found');
}
