import React from 'react';

export default function Loading() {
  return (
    <main className="container">
      <div style={{ marginBottom: 32, animation: 'pulse 1.5s infinite' }}>
        <div style={{ height: 32, width: 250, background: '#e2e8f0', borderRadius: 4, marginBottom: 12 }}></div>
        <div style={{ height: 16, width: 400, background: '#e2e8f0', borderRadius: 4 }}></div>
      </div>

      <div className="card" style={{ padding: 24, animation: 'pulse 1.5s infinite' }}>
        <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
          <div style={{ height: 40, width: 120, background: '#e2e8f0', borderRadius: 8 }}></div>
          <div style={{ height: 40, width: 120, background: '#e2e8f0', borderRadius: 8 }}></div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} style={{ height: 48, width: '100%', background: '#f1f5f9', borderRadius: 8 }}></div>
          ))}
        </div>
      </div>
    </main>
  );
}
