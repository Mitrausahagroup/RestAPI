import { Request, Response } from 'express';
import { PengembalianService } from '../services/pengembalian.service';
import { uploadCompressedImage } from '../utils/uploadImage';

const pengembalianService = new PengembalianService();

export const createPengembalian = async (req: Request, res: Response) => {
  try {
    const { userId, items } = JSON.parse(req.body.data);
    const file = req.file;

    let fotoUrl = '';
    if (file) {
      fotoUrl = await uploadCompressedImage(file.buffer);
    }

    const result = await pengembalianService.createPengembalian({
      userId,
      items,
      fotoUrl,
    });

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Gagal membuat pengembalian' });
  }
};

export const getAllPengembalian = async (_req: Request, res: Response) => {
  const result = await pengembalianService.getAll();
  res.json(result);
};

export const getPengembalianById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await pengembalianService.getById(id);
  if (!result) {
    res.status(404).json({ error: 'Data tidak ditemukan' });
  } 
  res.json(result);
};

export const updatePengembalian = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId, items } = JSON.parse(req.body.data);
    const file = req.file;

    let fotoUrl: string | undefined;

    const existing = await pengembalianService.getById(id);
    if (!existing) {
        res.status(404).json({ error: 'Data tidak ditemukan' });
    } 

    if (file) {
      fotoUrl = await uploadCompressedImage(file.buffer);
    }

    const result = await pengembalianService.updatePengembalian(id, {
      userId,
      items,
      fotoUrl,
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengupdate pengembalian' });
  }
};

export const deletePengembalian = async (req: Request, res: Response) => {

  const { id } = req.params;
  const result = await pengembalianService.removePengembalian(id);

  res.json({ result,success: true });
};
