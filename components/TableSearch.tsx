'use client';

import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

type Props = {
  tableId: string;
  placeholder?: string;
};

export default function TableSearch({ tableId, placeholder = 'Cari data...' }: Props) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const table = document.getElementById(tableId);
    if (!table) return;

    const tbody = table.querySelector('tbody');
    if (!tbody) return;

    const rows = tbody.querySelectorAll('tr');
    
    rows.forEach(row => {
      const text = row.textContent?.toLowerCase() || '';
      if (text.includes(query.toLowerCase())) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });
  }, [query, tableId]);

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
      <Search size={16} color="#64748b" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
      <input
        type="text"
        className="inputField"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ paddingLeft: 36, width: '100%' }}
      />
    </div>
  );
}
