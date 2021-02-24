import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { UnauthorizedException } from '@nestjs/common';
import { UserInterface } from '../../database/models/user.interface';
import { UserDAO } from '../../database/dao/user.dao';
import { AuthService } from './auth.service';
import { AuthTokenPayloadDTO } from '../../dto/auth-token-payload.dto';
import { User } from '../../database/models/user.model';
import { EnvKeyEnum } from '../../../app/enum/env-key.enum';
import { AuthDTO } from '../../dto/auth.dto';
import { JwtTokenTypeEnum } from '../../enum/jwt-token-type.enum';
import { RoleEnum } from '../../enum/role.enum';

const userDAOMock = () => ({
  update: jest.fn(),
  findOne: jest.fn(),
});

const configServiceMock = () => ({
  get: jest.fn(),
});

const user: UserInterface = { role: RoleEnum.user, email: '', name: '', password: '' };

describe('AuthService', () => {
  let service: AuthService, dao: UserDAO, config: ConfigService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        { provide: UserDAO, useFactory: userDAOMock },
        { provide: ConfigService, useFactory: configServiceMock },
      ],
    }).compile();

    dao = await module.resolve(UserDAO);
    config = await module.get(ConfigService);
    service = new AuthService(dao, config);
  });

  describe('getUserFromTokenPayload', () => {
    const payload = new AuthTokenPayloadDTO();
    payload.email = 'email@test.pl';

    it('uses dao to obtain user from token payload', async () => {
      jest.spyOn(dao, 'findOne').mockResolvedValue(user);

      const result = await service.getUserFromTokenPayload(payload);

      expect(dao.findOne).toHaveBeenCalledWith({ email: payload.email });
      expect(result).toEqual(user);
    });
  });

  describe('logout', () => {
    it('sets user token as null', async () => {
      user.token = 'token';

      await service.logout(user);

      user.token = null;

      expect(dao.update).toHaveBeenCalledWith(user as User, { token: null });
    });
  });

  describe('login', () => {
    it('uses config service to obtain all required env data', async () => {
      jest.spyOn(config, 'get').mockReturnValue('60');

      await service.login(user);

      expect(config.get).toHaveBeenCalledWith(EnvKeyEnum.JWTSecretKey);
      expect(config.get).toHaveBeenCalledWith(EnvKeyEnum.JWTRefreshSecretKey);
      expect(config.get).toHaveBeenCalledWith(EnvKeyEnum.JWTExpiresIn);
      expect(config.get).toHaveBeenCalledWith(EnvKeyEnum.JWTExpiresInUnit);
    });

    it('saves user with new token and returns auth dto', async () => {
      jest.spyOn(config, 'get').mockReturnValue('60');

      const result = await service.login(user);

      expect(dao.update).toHaveBeenCalled();
      expect(result).toBeInstanceOf(AuthDTO);
    });
  });

  describe('decodeToken', () => {
    const token = jwt.sign({ email: user.email }, 'secret', { expiresIn: 60 });

    it('obtains refresh token secret if token type is refresh token', async () => {
      jest.spyOn(config, 'get').mockReturnValue('secret');

      await service.decodeToken(token, JwtTokenTypeEnum.refreshToken);

      expect(config.get).toHaveBeenCalledWith(EnvKeyEnum.JWTSecretKey);
      expect(config.get).toHaveBeenCalledWith(EnvKeyEnum.JWTRefreshSecretKey);
    });

    it('obtains only token secret if token type is not refresh token', async () => {
      jest.spyOn(config, 'get').mockReturnValue('secret');

      await service.decodeToken(token, JwtTokenTypeEnum.token);

      expect(config.get).toHaveBeenCalledWith(EnvKeyEnum.JWTSecretKey);
    });

    it('returns decoded payload if token is correct', async () => {
      jest.spyOn(config, 'get').mockReturnValue('secret');

      const result = await service.decodeToken(token, JwtTokenTypeEnum.token);

      expect(result.email).toEqual(user.email);
    });

    it('throws unauthorized exception if token is incorrect', async () => {
      jest.spyOn(config, 'get').mockReturnValue('secret');

      await expect(service.decodeToken('bad', JwtTokenTypeEnum.token)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
