'use client';

import React from 'react';
import { PackageOpen } from 'lucide-react';
import Link from 'next/link';

type Props = {
  title?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
};

export default function EmptyState({ 
  title = 'Tidak Ada Data', 
  description = 'Belum ada data yang dapat ditampilkan untuk saat ini.',
  actionLabel,
  actionHref
}: Props) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '60px 24px',
      textAlign: 'center',
      background: '#f8fafc',
      borderRadius: '8px',
      border: '2px dashed #e2e8f0',
      color: '#64748b'
    }}>
      <div style={{ background: '#e2e8f0', padding: '16px', borderRadius: '50%', marginBottom: '16px' }}>
        <PackageOpen size={48} color="#94a3b8" />
      </div>
      <h3 style={{ margin: '0 0 8px 0', color: '#0f172a' }}>{title}</h3>
      <p style={{ margin: '0 0 24px 0', maxWidth: '400px' }}>{description}</p>
      
      {actionHref && actionLabel && (
        <Link href={actionHref} className="button">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
