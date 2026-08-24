'use client';

import React from 'react';

type Props = {
  value: string; // The raw number value as a string (e.g., '150000000')
  onChange: (val: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
};

export default function CurrencyInput({ value, onChange, placeholder, required, className = 'inputField' }: Props) {
  // Format to Rp string
  const formatRupiah = (val: string) => {
    if (!val) return '';
    const numberString = val.replace(/[^,\d]/g, '').toString();
    const split = numberString.split(',');
    const sisa = split[0].length % 3;
    let rupiah = split[0].substr(0, sisa);
    const ribuan = split[0].substr(sisa).match(/\d{3}/gi);

    if (ribuan) {
      const separator = sisa ? '.' : '';
      rupiah += separator + ribuan.join('.');
    }

    rupiah = split[1] != undefined ? rupiah + ',' + split[1] : rupiah;
    return rupiah ? `Rp ${rupiah}` : '';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Strip everything except numbers
    const rawVal = e.target.value.replace(/[^0-9]/g, '');
    onChange(rawVal);
  };

  return (
    <input
      type="text"
      className={className}
      value={formatRupiah(value)}
      onChange={handleInputChange}
      placeholder={placeholder || 'Rp 0'}
      required={required}
    />
  );
}
