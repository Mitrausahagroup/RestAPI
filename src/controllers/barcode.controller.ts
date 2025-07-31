// controllers/barcode.controller.ts
import { Request, Response } from 'express'
import { BarcodeService } from '../services/barcode.service'
import archiver from 'archiver'
import { generateBarcodeImageBuffer } from '../utils/generateBarcode'

const barcodeService = new BarcodeService()

export const generateBarcode = async (req: Request, res: Response) => {
  const count = parseInt(req.body.count)

  try {
    if (count && count > 1) {
     const barcodes = await barcodeService.generateMany(count); 

  const archive = archiver('zip', { zlib: { level: 9 } });
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', 'attachment; filename=barcodes.zip');
  archive.pipe(res);

  for (const barcode of barcodes) {
    const buffer = await generateBarcodeImageBuffer(barcode.id);
    archive.append(buffer, { name: `${barcode.id}.png` });
  }

  await archive.finalize();
  return;
    }

    // Jika hanya generate satu
    const single = await barcodeService.generateOne();
    const buffer = await generateBarcodeImageBuffer(single.id);

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename=${single.id}.png`);
    res.end(buffer);
    
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Gagal membuat barcode' })
  }
}


export const getAllBarcode = async (req: Request, res: Response) => {

   try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sortBy = (req.query.sortBy as string) || 'createdAt';
    const rawSortOrder = req.query.sortOrder as string;
    const sortOrder = rawSortOrder === 'asc' || rawSortOrder === 'desc' ? rawSortOrder : 'desc';

  const barcodes = await barcodeService.getAll(page, limit, sortBy, sortOrder)

   res.json({
      success: true,
      data: barcodes.data,
      total: barcodes.total,
      totalPage: barcodes.totalPage,
      currentPage: barcodes.currentPage,
    });
   } catch (error) {
     res.status(404).json({ message: 'tidak dapat membuat barcode' })
   }
}

export const getUnusedBarcode = async (req: Request, res: Response) => {
  const barcodes = await barcodeService.getUnused()
  res.json(barcodes)
}

export const getBarcodeById = async (req: Request, res: Response) => {
  const { id } = req.params
  const barcode = await barcodeService.getById(id)
  if (!barcode) {
     res.status(404).json({ message: 'Barcode tidak ditemukan' })
  }
  res.status(200).json(barcode)
}

export const getBarcodeSingleById = async (req: Request, res: Response) => {
  const { id } = req.params
  const barcode = await barcodeService.getById(id)
  if (!barcode) {
     res.status(404).json({ message: 'Barcode tidak ditemukan' })
  }

  const buffer = await generateBarcodeImageBuffer(id);

  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Content-Disposition', `attachment; filename=${id}.png`);
  res.end(buffer);
}

export const deleteAllBarcode = async (req: Request, res: Response) => {
  const result = await barcodeService.deleteAll()
  res.json({ message: 'Semua barcode berhasil dihapus', result })
}

export const deleteBarcodeById = async (req: Request, res: Response) => {
  const { id } = req.params
  try {
    const result = await barcodeService.deleteById(id)
    res.json({ message: 'Barcode berhasil dihapus', result })
  } catch (err) {
    res.status(404).json({ message: 'Barcode tidak ditemukan' })
  }
}
