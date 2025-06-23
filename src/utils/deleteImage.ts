import fs from 'fs';
import path from 'path';

export function deleteFile(relativePath: string) {
  const filePath = path.join(__dirname, '../../', relativePath);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}