import { Test } from '@nestjs/testing';
import * as argon2 from 'argon2';
import { PasswordsService } from './passwords.service';

describe('PasswordsService', () => {
  let service: PasswordsService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [],
    }).compile();

    service = new PasswordsService();
  });

  describe('hash', () => {
    it('returns properly hashed password', async () => {
      const hash = await service.hash('password');

      expect(await argon2.verify(hash, 'password')).toBeTruthy();
    });
  });

  describe('verify', () => {
    it('returns true if hash is correct', async () => {
      const hash = await argon2.hash('password');

      const result = await service.verify('password', hash);

      expect(result).toBeTruthy();
    });

    it('returns false if hash is incorrect', async () => {
      const hash = await argon2.hash('password1');

      const result = await service.verify('password', hash);

      expect(result).toBeFalsy();
    });
  });
});
