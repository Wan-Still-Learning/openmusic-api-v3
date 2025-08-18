// src/services/storage/StorageService.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class StorageService {
  constructor(folder) {
    this._folder = folder;
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
  }

  writeFile(file, meta) {
    // Handle different possible filename properties
    const originalFilename = meta.filename || meta.originalname || meta.name || 'upload';
    const filename = +new Date() + '_' + originalFilename;
    const filepath = path.resolve(this._folder, filename);
    const fileStream = fs.createWriteStream(filepath);

    return new Promise((resolve, reject) => {
      file.pipe(fileStream);
      file.on('end', () => fileStream.end());
      fileStream.on('finish', () => resolve(filename));
      fileStream.on('error', (error) => reject(error));
    });
  }
}

export default StorageService;