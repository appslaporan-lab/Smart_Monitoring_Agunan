'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import type { InputHTMLAttributes } from 'react';

type PasswordInputProps = InputHTMLAttributes<HTMLInputElement>;

export default function PasswordInput(props: PasswordInputProps) {
  const [show, setShow] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      <input 
        type={show ? 'text' : 'password'} 
        name="password" 
        className="inputField" 
        placeholder="Masukkan password" 
        required 
        {...props}
        style={{ paddingRight: '40px', width: '100%', ...props.style }}
      />
      <button 
        type="button" 
        onClick={() => setShow(!show)}
        style={{
          position: 'absolute',
          right: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#64748b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0
        }}
        title={show ? "Sembunyikan password" : "Tampilkan password"}
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}
