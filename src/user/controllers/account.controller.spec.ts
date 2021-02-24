import { Test } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { PasswordsService } from '../providers/services/passwords.service';
import { UsersService } from '../providers/services/users.service';
import { UserInterface } from '../database/models/user.interface';
import { AccountController } from './account.controller';
import { ChangePasswordDTO } from '../dto/change-password.dto';
import { UpdateAccountDTO } from '../dto/update-account.dto';

const usersServiceMock = () => ({
  update: jest.fn(),
  getOne: jest.fn(),
});

const passwordServiceMock = () => ({
  verify: jest.fn(),
  hash: jest.fn(),
});

const user: UserInterface = { id: 'id', email: '', name: '', password: '' };

describe('AccountController', () => {
  let passwordsService: PasswordsService, usersService: UsersService, controller: AccountController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        { provide: PasswordsService, useFactory: passwordServiceMock },
        { provide: UsersService, useFactory: usersServiceMock },
      ],
    }).compile();

    passwordsService = await module.resolve(PasswordsService);
    usersService = await module.get(UsersService);
    controller = new AccountController(usersService, passwordsService);
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
});
