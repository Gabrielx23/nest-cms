import { Test } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { PasswordsService } from '../providers/services/passwords.service';
import { UsersService } from '../providers/services/users.service';
import { AuthService } from '../providers/services/auth.service';
import { AuthController } from './auth.controller';
import { LoginDTO } from '../dto/login.dto';
import { AuthDTO } from '../dto/auth.dto';
import { RefreshTokenDTO } from '../dto/refresh-token.dto';
import { AuthTokenPayloadDTO } from '../dto/auth-token-payload.dto';
import { JwtTokenTypeEnum } from '../enum/jwt-token-type.enum';
import { UserInterface } from '../database/models/user.interface';
import { RegisterDTO } from '../dto/register.dto';

const usersServiceMock = () => ({
  getOne: jest.fn(),
  create: jest.fn(),
});

const passwordServiceMock = () => ({
  verify: jest.fn(),
  hash: jest.fn(),
});

const authServiceMock = () => ({
  decodeToken: jest.fn(),
  login: jest.fn(),
  logout: jest.fn(),
});

const user: UserInterface = { email: '', name: '', password: '' };

describe('AuthController', () => {
  let authService: AuthService,
    passwordsService: PasswordsService,
    usersService: UsersService,
    controller: AuthController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        { provide: AuthService, useFactory: authServiceMock },
        { provide: PasswordsService, useFactory: passwordServiceMock },
        { provide: UsersService, useFactory: usersServiceMock },
      ],
    }).compile();

    authService = await module.resolve(AuthService);
    passwordsService = await module.resolve(PasswordsService);
    usersService = await module.get(UsersService);
    controller = new AuthController(usersService, authService, passwordsService);
  });

  describe('register', () => {
    const dto = new RegisterDTO();
    dto.email = 'test@test.pl';
    dto.password = 'password';

    it('uses passwords service to hash user password', async () => {
      await controller.register(dto);

      expect(passwordsService.hash).toHaveBeenCalledWith(dto.password);
    });

    it('uses create user service to create user with given data', async () => {
      jest.spyOn(passwordsService, 'hash').mockResolvedValue('hashed');

      const partial = { ...dto, password: 'hashed' };

      await controller.register(dto);

      expect(usersService.create).toHaveBeenCalledWith(partial);
    });
  });

  describe('login', () => {
    const dto = new LoginDTO();
    dto.email = 'test@test.pl';
    dto.password = 'password';

    it('uses users service to obtain user by email and throw exception if user not exist', async () => {
      jest.spyOn(usersService, 'getOne').mockResolvedValue(null);

      await expect(controller.login(dto)).rejects.toThrow(BadRequestException);

      expect(usersService.getOne).toHaveBeenCalledWith({ email: dto.email });
    });

    it('throws exception if user password does not match', async () => {
      jest.spyOn(usersService, 'getOne').mockResolvedValue(user);
      jest.spyOn(passwordsService, 'verify').mockResolvedValue(false);

      await expect(controller.login(dto)).rejects.toThrow(BadRequestException);

      expect(passwordsService.verify).toHaveBeenCalledWith(dto.password, user.password);
    });

    it('uses auth service to log in user and returns it result', async () => {
      jest.spyOn(usersService, 'getOne').mockResolvedValue(user);
      jest.spyOn(passwordsService, 'verify').mockResolvedValue(true);
      jest.spyOn(authService, 'login').mockResolvedValue(new AuthDTO());

      const result = await controller.login(dto);

      expect(result).toEqual(new AuthDTO());
      expect(authService.login).toHaveBeenCalledWith(user);
    });
  });

  describe('refresh', () => {
    const dto = new RefreshTokenDTO();
    dto.refreshToken = 'refreshToken';

    const payloadDTO = new AuthTokenPayloadDTO();
    payloadDTO.email = 'email@test.pl';

    it('uses auth service to decode token', async () => {
      jest.spyOn(usersService, 'getOne').mockResolvedValue(user);
      jest.spyOn(authService, 'decodeToken').mockResolvedValue(payloadDTO);

      await controller.refresh(dto);

      expect(authService.decodeToken).toHaveBeenCalledWith(
        dto.refreshToken,
        JwtTokenTypeEnum.refreshToken,
      );
    });

    it('uses users service to obtain user by decoded email', async () => {
      jest.spyOn(usersService, 'getOne').mockResolvedValue(user);
      jest.spyOn(authService, 'decodeToken').mockResolvedValue(payloadDTO);

      await controller.refresh(dto);

      expect(usersService.getOne).toHaveBeenCalledWith({ email: payloadDTO.email });
    });

    it('throws exception if user not exist by decoded email', async () => {
      jest.spyOn(usersService, 'getOne').mockResolvedValue(null);
      jest.spyOn(authService, 'decodeToken').mockResolvedValue(payloadDTO);

      await expect(controller.refresh(dto)).rejects.toThrow(BadRequestException);
    });

    it('uses auth service to re log in user and returns it result', async () => {
      jest.spyOn(usersService, 'getOne').mockResolvedValue(user);
      jest.spyOn(authService, 'decodeToken').mockResolvedValue(payloadDTO);
      jest.spyOn(authService, 'login').mockResolvedValue(new AuthDTO());

      const result = await controller.refresh(dto);

      expect(result).toEqual(new AuthDTO());
      expect(authService.login).toHaveBeenCalledWith(user);
    });
  });

  describe('logout', () => {
    it('uses auth service to log out user', async () => {
      await controller.logout(user);

      expect(authService.logout).toHaveBeenCalledWith(user);
    });
  });
});
