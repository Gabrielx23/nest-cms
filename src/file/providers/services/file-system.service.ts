import { Injectable } from '@nestjs/common';
import fs from 'fs';

@Injectable()
export class FileSystemService {
  public deleteIfExist(path: string): void {
    try {
      fs.unlinkSync(path);
    } catch (err) {}
  }
}
