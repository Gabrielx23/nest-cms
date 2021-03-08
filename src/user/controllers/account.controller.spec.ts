import { Test } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PasswordsService } from '../providers/services/passwords.service';
import { UsersService } from '../providers/services/users.service';
import { UserInterface } from '../database/models/user.interface';
import { AccountController } from './account.controller';
import { ChangePasswordDTO } from '../dto/change-password.dto';
import { UpdateAccountDTO } from '../dto/update-account.dto';
import { RoleEnum } from '../enum/role.enum';
import { PasswordResetRequestDTO } from '../dto/password-reset-request.dto';
import { ConfigService } from '@nestjs/config';
import { PasswordResetDTO } from '../dto/password-reset.dto';

const usersServiceMock = () => ({
  update: jest.fn(),
  getOne: jest.fn(),
  resetPasswordRequest: jest.fn(),
  resetPassword: jest.fn(),
});

const passwordServiceMock = () => ({
  verify: jest.fn(),
  hash: jest.fn(),
});

const configServiceMock = () => ({
  get: jest.fn(),
});

const user: UserInterface = { id: 'id', role: RoleEnum.user, email: '', name: '', password: '' };

describe('AccountController', () => {
  let passwordsService: PasswordsService,
    usersService: UsersService,
    controller: AccountController,
    configService: ConfigService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        { provide: PasswordsService, useFactory: passwordServiceMock },
        { provide: UsersService, useFactory: usersServiceMock },
        { provide: ConfigService, useFactory: configServiceMock },
      ],
    }).compile();

    passwordsService = await module.resolve(PasswordsService);
    usersService = await module.get(UsersService);
    configService = await module.get(ConfigService);
    controller = new AccountController(usersService, passwordsService, configService);
  });

  describe('changePassword', () => {
    const dto = new ChangePasswordDTO();
    dto.oldPassword = 'old';
    dto.password = 'new';

    it('throws exception if user password does not match', async () => {
      jest.spyOn(passwordsService, 'verify').mockResolvedValue(false);

      await expect(controller.changePassword(user, dto)).rejects.toThrow(BadRequestException);

      expect(passwordsService.verify).toHaveBeenCalledWith(dto.oldPassword, user.password);
    });

    it('uses passwords service to hash user password', async () => {
      jest.spyOn(passwordsService, 'verify').mockResolvedValue(true);

      await controller.changePassword(user, dto);

      expect(passwordsService.hash).toHaveBeenCalledWith(dto.password);
    });

    it('uses users service to update user password', async () => {
      jest.spyOn(passwordsService, 'verify').mockResolvedValue(true);
      jest.spyOn(passwordsService, 'hash').mockResolvedValue('hashed');

      await controller.changePassword(user, dto);

      expect(usersService.update).toHaveBeenCalledWith(user, { password: 'hashed' });
    });

    it('returns updated user', async () => {
      jest.spyOn(passwordsService, 'verify').mockResolvedValue(true);
      jest.spyOn(usersService, 'getOne').mockResolvedValue(user);

      const result = await controller.changePassword(user, dto);

      expect(result).toEqual(user);
      expect(usersService.getOne).toHaveBeenCalledWith({ id: 'id' }, true);
    });
  });

  describe('update', () => {
    const dto = new UpdateAccountDTO();

    it('uses users service to update user', async () => {
      await controller.update(user, dto);

      expect(usersService.update).toHaveBeenCalledWith(user, dto);
    });

    it('returns updated user', async () => {
      jest.spyOn(usersService, 'getOne').mockResolvedValue(user);

      const result = await controller.update(user, dto);

      expect(result).toEqual(user);
      expect(usersService.getOne).toHaveBeenCalledWith({ id: 'id' }, true);
    });
  });

  describe('get', () => {
    it('returns logged user', async () => {
      jest.spyOn(usersService, 'getOne').mockResolvedValue(user);

      const result = await controller.get(user);

      expect(result).toEqual(user);
      expect(usersService.getOne).toHaveBeenCalledWith({ id: 'id' }, true);
    });
  });

  describe('resetPasswordRequest', () => {
    const dto = new PasswordResetRequestDTO();

    it('throws exception if user not exist', async () => {
      await expect(controller.resetPasswordRequest(dto)).rejects.toThrow(NotFoundException);
    });

    it('uses user service to send reset password request', async () => {
      jest.spyOn(usersService, 'getOne').mockResolvedValue(user);
      jest.spyOn(configService, 'get').mockReturnValue('url');

      await controller.resetPasswordRequest(dto);

      expect(usersService.resetPasswordRequest).toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    const dto = new PasswordResetDTO();
    dto.token =
      'a653ecdd6aea98309f1e3258d4a12448ea9939f3f5021062180985ba14da1daa9aec9401ffe633d8b81bfa80c78d9676cfe170c2ac1975de9bc34a3739f61e07da4bda02ae67d2dc49d94f081c164635e39b6c7e07c3b855534216eade6c6c06d922ce67e1bef413ee40bcd903ca17a6ae1ad65cccca766f58ca52b6b0b2ba3b6e8a02b7c220578cb78285388ca840590f7cf64f35e8954140c80b80f60408988eeb6e01164ae7db4817fc344f;';

    it('throws exception if user not exist', async () => {
      jest.spyOn(configService, 'get').mockReturnValue('secret');

      await expect(controller.resetPassword(dto)).rejects.toThrow(NotFoundException);
    });

    it('uses user service to reset user password', async () => {
      jest.spyOn(passwordsService, 'hash').mockResolvedValue('password');
      jest.spyOn(configService, 'get').mockReturnValue('secret');
      jest.spyOn(usersService, 'getOne').mockResolvedValue(user);

      await controller.resetPassword(dto);

      expect(usersService.resetPassword).toHaveBeenCalled();
    });
  });
});
