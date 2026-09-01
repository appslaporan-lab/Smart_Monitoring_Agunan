'use client';

import React from 'react';
import { Printer } from 'lucide-react';

export default function PrintButton({ label = 'Cetak PDF' }: { label?: string }) {
  return (
    <button 
      onClick={() => window.print()} 
      className="button secondary no-print"
      style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
    >
      <Printer size={16} />
      {label}
    </button>
  );
}
