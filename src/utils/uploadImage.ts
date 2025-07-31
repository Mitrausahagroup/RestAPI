import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { format } from 'date-fns';

export const uploadCompressedImage = async (
  buffer: Buffer,
  options: {
    folder?: string;
    width?: number;
    quality?: number;
    salesName?: string; // Nama sales untuk penamaan file
    prefix?: string; // Prefix opsional (misal: 'pengambilan', 'penurunan')
  } = {}
): Promise<string> => {
  // Set default values
  const {
    folder = 'uploads',
    width = 800,
    quality = 70,
    salesName = '',
    prefix = ''
  } = options;

  // Format tanggal saat ini (YYYYMMDD)
  const dateString = format(new Date(), 'yyyyMMdd');
  
  // Generate nama file
  let filename: string;
  
  if (salesName) {
    // Bersihkan nama sales dari karakter khusus dan spasi
    const cleanSalesName = salesName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-') // Ganti karakter non-alphanumeric dengan dash
      .replace(/-+/g, '-')         // Gabungkan multiple dash
      .replace(/^-|-$/g, '');      // Hapus dash di awal/akhir
    
    // Gabungkan prefix (jika ada), nama sales, dan tanggal
    filename = `${prefix ? `${prefix}-` : ''}${cleanSalesName}-${dateString}.webp`;
  } else {
    // Fallback ke UUID jika tidak ada nama sales
    filename = `${prefix ? `${prefix}-` : ''}${Date.now()}.webp`;
  }

  const outputPath = path.join(__dirname, `../../${folder}/`, filename);

  // Pastikan folder ada
  if (!fs.existsSync(path.join(__dirname, `../../${folder}/`))) {
    fs.mkdirSync(path.join(__dirname, `../../${folder}/`), { recursive: true });
  }

  // Cek apakah file sudah ada (tambahkan counter jika perlu)
  let finalOutputPath = outputPath;
  let counter = 1;
  while (fs.existsSync(finalOutputPath)) {
    const ext = path.extname(filename);
    const base = path.basename(filename, ext);
    finalOutputPath = path.join(
      path.dirname(outputPath),
      `${base}-${counter}${ext}`
    );
    counter++;
  }

  await sharp(buffer)
    .resize({ width })
    .webp({ quality })
    .toFile(finalOutputPath);

  return `/${folder}/${path.basename(finalOutputPath)}`;
};