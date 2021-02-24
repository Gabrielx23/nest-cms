import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';

@Injectable()
export class PasswordsService {
  public async hash(password: string): Promise<string> {
    return await argon2.hash(password);
  }

  public async verify(password: string, hash: string): Promise<boolean> {
    return await argon2.verify(hash, password);
  }
}
