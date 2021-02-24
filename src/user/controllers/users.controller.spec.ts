import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from '../providers/services/users.service';
import { UserInterface } from '../database/models/user.interface';
import { RoleEnum } from '../enum/role.enum';
import { UsersController } from './users.controller';
import { CreateUserDTO } from '../dto/create-user.dto';
import { PasswordsService } from '../providers/services/passwords.service';
import { UpdateUserDTO } from '../dto/update-user.dto';

const usersServiceMock = () => ({
  getOne: jest.fn(),
  getAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
});

const passwordServiceMock = () => ({
  hash: jest.fn(),
});

const user: UserInterface = { role: RoleEnum.user, email: '', name: '', password: '' };

describe('UsersController', () => {
  let usersService: UsersService, passwordsService: PasswordsService, controller: UsersController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        { provide: UsersService, useFactory: usersServiceMock },
        { provide: PasswordsService, useFactory: passwordServiceMock },
      ],
    }).compile();

    usersService = await module.resolve(UsersService);
    passwordsService = await module.resolve(PasswordsService);
    controller = new UsersController(usersService, passwordsService);
  });

  describe('create', () => {
    const dto = new CreateUserDTO();
    dto.email = 'test@test.pl';

    it('uses passwords service to hash user password', async () => {
      await controller.create(dto);

      expect(passwordsService.hash).toHaveBeenCalledWith(dto.password);
    });

    it('uses users service to create user with given data', async () => {
      jest.spyOn(passwordsService, 'hash').mockResolvedValue('hashed');

      const partial = { ...dto, password: 'hashed' };

      await controller.create(dto);

      expect(usersService.create).toHaveBeenCalledWith(partial);
    });

    it('returns created user', async () => {
      jest.spyOn(usersService, 'getOne').mockResolvedValue(user);

      const result = await controller.create(dto);

      expect(result).toEqual(user);
      expect(usersService.getOne).toHaveBeenCalledWith({ email: dto.email }, true);
    });
  });

  describe('update', () => {
    const dto = new UpdateUserDTO();
    dto.email = 'test@test.pl';

    it('uses users service to obtain user by id and throw exception if user not exist', async () => {
      jest.spyOn(usersService, 'getOne').mockResolvedValue(null);

      await expect(controller.update('id', dto)).rejects.toThrow(NotFoundException);

      expect(usersService.getOne).toHaveBeenCalledWith({ id: 'id' });
    });

    it('uses users service to update user with given data', async () => {
      jest.spyOn(usersService, 'getOne').mockResolvedValue(user);

      await controller.update('id', dto);

      expect(usersService.update).toHaveBeenCalledWith(user, dto);
    });

    it('returns updated user', async () => {
      jest.spyOn(usersService, 'getOne').mockResolvedValue(user);

      const result = await controller.update('id', dto);

      expect(result).toEqual(user);
      expect(usersService.getOne).toHaveBeenCalledWith({ id: 'id' }, true);
    });
  });

  describe('delete', () => {
    it('uses users service to obtain user by id and throw exception if user not exist', async () => {
      jest.spyOn(usersService, 'getOne').mockResolvedValue(null);

      await expect(controller.delete('id')).rejects.toThrow(NotFoundException);

      expect(usersService.getOne).toHaveBeenCalledWith({ id: 'id' });
    });

    it('uses users service to delete user', async () => {
      jest.spyOn(usersService, 'getOne').mockResolvedValue(user);

      await controller.delete('id');

      expect(usersService.destroy).toHaveBeenCalledWith(user);
    });
  });

  describe('get', () => {
    it('uses users service to obtain user by id and throw exception if user not exist', async () => {
      jest.spyOn(usersService, 'getOne').mockResolvedValue(null);

      await expect(controller.get('id')).rejects.toThrow(NotFoundException);

      expect(usersService.getOne).toHaveBeenCalledWith({ id: 'id' }, true);
    });

    it('returns obtained user', async () => {
      jest.spyOn(usersService, 'getOne').mockResolvedValue(user);

      const result = await controller.get('id');

      expect(result).toEqual(user);
    });
  });

  describe('getAll', () => {
    it('returns all obtained user', async () => {
      jest.spyOn(usersService, 'getAll').mockResolvedValue([user]);

      const result = await controller.getAll();

      expect(result).toEqual([user]);
      expect(usersService.getAll).toHaveBeenCalledWith(true);
    });
  });
});
