import sharp from 'sharp';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

export const uploadCompressedImage = async (
  buffer: Buffer,
  folder: string = 'uploads',
  width: number = 800,
  quality: number = 70
): Promise<string> => {
  const filename = `${uuidv4()}.webp`;
  const outputPath = path.join(__dirname, `../../${folder}/`, filename);

  // Pastikan folder ada
  if (!fs.existsSync(path.join(__dirname, `../../${folder}/`))) {
    fs.mkdirSync(path.join(__dirname, `../../${folder}/`), { recursive: true });
  }

  await sharp(buffer)
    .resize({ width })
    .webp({ quality })
    .toFile(outputPath);

  return `/${folder}/${filename}`;
};
