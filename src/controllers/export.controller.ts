import { Request, Response } from 'express';
import ExcelJS from 'exceljs';
import prisma from '../utils/prisma';
import { format, parse } from 'date-fns';

export const exportAllTransaksi = async (req: Request, res: Response) => {
  try {
    const monthParam = req.query.month as string | undefined;
    let startDate: Date;
    let endDate: Date;

    if (monthParam) {
      const parsed = parse(monthParam + '-01', 'yyyy-MM-dd', new Date());
      startDate = new Date(parsed.getFullYear(), parsed.getMonth(), 1);
      endDate = new Date(parsed.getFullYear(), parsed.getMonth() + 1, 0, 23, 59, 59);
    } else {
      endDate = new Date();
      startDate = new Date();
      startDate.setDate(endDate.getDate() - 30);
    }

    const [pengambilan, penurunan, pengembalian, semuaToko, semuaBarang] = await Promise.all([
      prisma.pengambilan.findMany({
        where: { createdAt: { gte: startDate, lte: endDate } },
        include: { items: { include: { barang: true } }, sales: true },
      }),
      prisma.penurunan.findMany({
        where: { createdAt: { gte: startDate, lte: endDate } },
        include: { items: { include: { barang: true } }, sales: true, toko: true },
      }),
      prisma.pengembalian.findMany({
        where: { createdAt: { gte: startDate, lte: endDate } },
        include: { items: { include: { barang: true } }, sales: true },
      }),
      prisma.toko.findMany({ include: { sales: true } }),
      prisma.barang.findMany(),
    ]);

    const workbook = new ExcelJS.Workbook();

    const addSheet = (title: string, records: any[], type: 'pengambilan' | 'penurunan' | 'pengembalian') => {
      const sheet = workbook.addWorksheet(title);

      if (type === 'pengambilan') {
        sheet.columns = [
          { header: 'Tanggal', key: 'tanggal', width: 20 },
          { header: 'Nama Barang', key: 'barang', width: 80 },
          { header: 'Sales', key: 'sales', width: 30 },
          { header: 'Status', key: 'status', width: 20 },
        ];

        records.forEach((r: any) => {
          const gabunganBarang = r.items.map((item: any) =>
            `${item.barang?.nama || '-'} (${item.barang?.varian || '-'}) x${item.jumlah}`
          ).join(', ');

          sheet.addRow({
            tanggal: format(r.createdAt, 'dd/MM/yyyy'),
            barang: gabunganBarang,
            sales: r.sales?.nama || '',
            status: r.status || '',
          });
        });
      }

      if (type === 'penurunan') {
        sheet.columns = [
          { header: 'Tanggal', key: 'tanggal', width: 20 },
          { header: 'Nama Barang', key: 'barang', width: 80 },
          { header: 'Sales', key: 'sales', width: 30 },
          { header: 'Toko', key: 'toko', width: 30 },
          { header: 'Alamat', key: 'alamat', width: 50 },
        ];

        records.forEach((r: any) => {
          const gabunganBarang = r.items.map((item: any) =>
            `${item.barang?.nama || '-'} (${item.barang?.varian || '-'}) x${item.jumlah}`
          ).join(', ');

          sheet.addRow({
            tanggal: format(r.createdAt, 'dd/MM/yyyy'),
            barang: gabunganBarang,
            sales: r.sales?.nama || '',
            toko: r.toko?.nama || '',
            alamat: r.toko?.alamat || '',
          });
        });
      }

      if (type === 'pengembalian') {
        sheet.columns = [
          { header: 'Tanggal', key: 'tanggal', width: 20 },
          { header: 'Nama Barang', key: 'barang', width: 80 },
          { header: 'Sales', key: 'sales', width: 20 },
        ];

        records.forEach((r: any) => {
          const gabunganBarang = r.items.map((item: any) =>
            `${item.barang?.nama || '-'} (${item.barang?.varian || '-'}) x${item.jumlah} - (${item.kondisi})`
          ).join(', ');

          sheet.addRow({
            tanggal: format(r.createdAt, 'dd/MM/yyyy'),
            barang: gabunganBarang,
            sales: r.sales?.nama || '',
          });
        });
      }
    };

    const tokoSheet = workbook.addWorksheet('Toko');
    tokoSheet.columns = [
      { header: 'Tanggal', key: 'tanggal', width: 30 },
      { header: 'Nama Toko', key: 'nama', width: 30 },
      { header: 'Alamat', key: 'alamat', width: 50 },
      { header: 'Telp', key: 'telp', width: 30 },
      { header: 'Sales', key: 'sales', width: 30 },
    ];
    semuaToko.forEach((toko) => {
      tokoSheet.addRow({
        tanggal: format(toko.createdAt, 'dd/MM/yyyy'),
        nama: toko.nama,
        alamat: toko.alamat,
        telp: toko.noHp,
        sales: toko.sales?.nama || '',
      });
    });

    const barangSheet = workbook.addWorksheet('Barang');
    barangSheet.columns = [
      { header: 'Nama Barang', key: 'nama', width: 30 },
      { header: 'Varian', key: 'varian', width: 20 },
      { header: 'Stok', key: 'stok', width: 15 },
    ];
    semuaBarang.forEach((barang) => {
      barangSheet.addRow({
        nama: barang.nama,
        varian: barang.varian,
        stok: barang.stok,
      });
    });

    addSheet('Pengambilan', pengambilan, 'pengambilan');

    // Rekap Pengambilan
    const rekapPengambilan = workbook.addWorksheet('Rekap Pengambilan');
    rekapPengambilan.columns = [
      { header: 'Nama Barang', key: 'nama', width: 30 },
      { header: 'Varian', key: 'varian', width: 20 },
      { header: 'Jumlah', key: 'jumlah', width: 15 },
    ];
    semuaBarang.forEach((b) => {
      const jumlah = pengambilan.flatMap(p => p.items)
        .filter(i => i.barangId === b.id)
        .reduce((sum, i) => sum + i.jumlah, 0);
      if (jumlah > 0) {
        rekapPengambilan.addRow({ nama: b.nama, varian: b.varian, jumlah });
      }
    });

    addSheet('Penurunan', penurunan, 'penurunan');

    // Rekap Penurunan
    const rekapPenurunan = workbook.addWorksheet('Rekap Penurunan');
    rekapPenurunan.columns = rekapPengambilan.columns;
    semuaBarang.forEach((b) => {
      const jumlah = penurunan.flatMap(p => p.items)
        .filter(i => i.barangId === b.id)
        .reduce((sum, i) => sum + i.jumlah, 0);
      if (jumlah > 0) {
        rekapPenurunan.addRow({ nama: b.nama, varian: b.varian, jumlah });
      }
    });

    addSheet('Pengembalian', pengembalian, 'pengembalian');

    // Rekap Pengembalian
    const rekapPengembalian = workbook.addWorksheet('Rekap Pengembalian');
    rekapPengembalian.columns = [
      { header: 'Nama Barang', key: 'nama', width: 30 },
      { header: 'Varian', key: 'varian', width: 20 },
      { header: 'Baik', key: 'baik', width: 15 },
      { header: 'Rusak', key: 'rusak', width: 15 },
    ];
    semuaBarang.forEach((b) => {
      const baik = pengembalian.flatMap(p => p.items)
        .filter(i => i.barangId === b.id && i.kondisi === 'BAIK')
        .reduce((sum, i) => sum + i.jumlah, 0);
      const rusak = pengembalian.flatMap(p => p.items)
        .filter(i => i.barangId === b.id && i.kondisi === 'RUSAK')
        .reduce((sum, i) => sum + i.jumlah, 0);
      if (baik > 0 || rusak > 0) {
        rekapPengembalian.addRow({ nama: b.nama, varian: b.varian, baik, rusak });
      }
    });

    // ===================== Transaksi Sheets =========================

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=rekap_transaksi.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal meng-export data' });
  }
};
