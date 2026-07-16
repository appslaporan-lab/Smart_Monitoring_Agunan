import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import PDFDocument from 'pdfkit';
import { Parser } from 'json2csv';
import { Readable } from 'stream';

const bufferFromStream = (stream: Readable) =>
  new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });

export async function GET(request: Request) {
  const url = new URL(request.url);
  const format = url.searchParams.get('format');

  const records = await prisma.beritaAcara.findMany({ include: { agunan: true } });

  if (format === 'excel') {
    const fields = [
      { label: 'ID', value: 'id' },
      { label: 'Nomor Dokumen', value: 'nomorDokumen' },
      { label: 'Nomor Register', value: 'nomorRegister' },
      { label: 'Nama Nasabah', value: 'namaNasabah' },
      { label: 'Alamat', value: 'alamat' },
      { label: 'Nomor Rekening', value: 'nomorRekening' },
      { label: 'Tanggal Lunas', value: (row: any) => row.tanggalLunas ? row.tanggalLunas.toISOString().split('T')[0] : '' },
      { label: 'Jenis Agunan', value: 'jenisAgunan' },
      { label: 'Yang Menyerahkan', value: 'yangMenyerahkan' },
      { label: 'Menyetujui', value: 'menyetujui' },
      { label: 'Yang Menerima', value: 'yangMenerima' },
      { label: 'Tanggal Dibuat', value: (row: any) => row.createdAt.toISOString() },
      { label: 'Kode Register Agunan', value: 'agunan.kodeRegister' },
    ];
    const parser = new Parser({ fields });
    const csv = parser.parse(records);
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="berita-acara.csv"',
      },
    });
  }

  if (format === 'pdf') {
    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    doc.fontSize(14).text('Daftar Berita Acara Serah Terima Agunan', { align: 'center' });
    doc.moveDown(1);
    records.forEach((item, index) => {
      doc.fontSize(10).text(`${index + 1}. ${item.nomorDokumen}`, { underline: true });
      doc.text(`   Nasabah: ${item.namaNasabah}`);
      item.nomorDokumen;
      item.nomorRegister;
      item.namaNasabah;
      item.alamat || '-';
      item.nomorRekening || '-';
      item.tanggalLunas ? item.tanggalLunas.toISOString().split('T')[0] : '-';
      item.jenisAgunan;
      item.ttdAdmKredit || '-';
      item.ttdYangMenyerahkan || '-';
      item.ttdYangMenerima || '-';
      item.ttdMengetahui || '-';
      item.createdAt.toISOString().split('T')[0];
    });
    doc.end();
    const pdfBuffer = await bufferFromStream(doc);
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="berita-acara.pdf"',
      },
    });
  }

  return NextResponse.json({ error: 'Format tidak dikenali.' }, { status: 400 });
}
