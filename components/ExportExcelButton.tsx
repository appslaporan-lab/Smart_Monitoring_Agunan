'use client';

import React from 'react';
import * as XLSX from 'xlsx';
import { Download } from 'lucide-react';
import toast from 'react-hot-toast';

type Props = {
  data: any[];
  fileName: string;
  sheetName?: string;
  buttonLabel?: string;
};

export default function ExportExcelButton({ data, fileName, sheetName = 'Sheet1', buttonLabel = 'Ekspor Excel' }: Props) {
  const handleExport = () => {
    if (data.length === 0) {
      toast.error('Tidak ada data untuk diekspor');
      return;
    }

    try {
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      
      XLSX.writeFile(workbook, `${fileName}.xlsx`);
      toast.success('Berhasil mengekspor ke Excel');
    } catch (error) {
      console.error(error);
      toast.error('Terjadi kesalahan saat mengekspor data');
    }
  };

  return (
    <button 
      onClick={handleExport} 
      className="button" 
      style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#16a34a', color: 'white', borderColor: '#16a34a' }}
    >
      <Download size={16} />
      {buttonLabel}
    </button>
  );
}
