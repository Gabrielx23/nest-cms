import { Test } from '@nestjs/testing';
import { UserDAO } from '../../database/dao/user.dao';
import { UserInterface } from '../../database/models/user.interface';
import { UsersService } from './users.service';
import { BadRequestException } from '@nestjs/common';
import { RoleEnum } from '../../enum/role.enum';

const userDAOMock = () => ({
  findOne: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
});

const user: UserInterface = {
  role: RoleEnum.user,
  email: '',
  name: '',
  password: 'password',
  token: 'token',
};

describe('UsersService', () => {
  let service: UsersService, dao: UserDAO;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [{ provide: UserDAO, useFactory: userDAOMock }],
    }).compile();

    dao = await module.resolve(UserDAO);
    service = new UsersService(dao);
  });

  describe('getOne', () => {
    it('uses dao to obtain user by conditions', async () => {
      jest.spyOn(dao, 'findOne').mockResolvedValue(user);

      const result = await service.getOne({ id: 'id' });

      expect(dao.findOne).toBeCalledWith({ id: 'id' }, false);
      expect(result).toEqual(user);
    });

    it('returns user without password and token if raw flag is true', async () => {
      jest.spyOn(dao, 'findOne').mockResolvedValue(user);

      const result = await service.getOne({ id: 'id' }, true);

      const { password, token, ...userData } = user;

      expect(dao.findOne).toBeCalledWith({ id: 'id' }, true);
      expect(result).toEqual(userData);
    });
  });

  describe('getAll', () => {
    it('uses dao to obtain all users', async () => {
      jest.spyOn(dao, 'findAll').mockResolvedValue([user]);

      const result = await service.getAll();

      expect(dao.findAll).toBeCalled();
      expect(result).toEqual([user]);
    });
  });

  describe('create', () => {
    const partial = { email: 'email', password: 'password' };

    it('throws bad request exception if email is already in use', async () => {
      jest.spyOn(dao, 'findOne').mockResolvedValue(user);

      await expect(service.create({ email: 'email' })).rejects.toThrow(BadRequestException);

      expect(dao.findOne).toHaveBeenCalledWith({ email: 'email' });
    });

    it('uses dao to create user', async () => {
      jest.spyOn(dao, 'findOne').mockResolvedValue(null);
      jest.spyOn(dao, 'create').mockResolvedValue(user);

      await service.create(partial);

      expect(dao.create).toHaveBeenCalledWith(partial);
    });

    it('returns created user', async () => {
      jest.spyOn(dao, 'findOne').mockResolvedValue(null);
      jest.spyOn(dao, 'create').mockResolvedValue(user);

      const result = await service.create(partial);

      expect(result).toEqual(user);
    });
  });

  describe('update', () => {
    const partial = { email: 'email', password: 'password' };

    it('throws bad request exception if email is already in use', async () => {
      const user2: UserInterface = {
        role: RoleEnum.user,
        id: 'id',
        email: '',
        name: '',
        password: '',
      };

      jest.spyOn(dao, 'findOne').mockResolvedValue(user2);

      await expect(service.update(user, { email: 'email' })).rejects.toThrow(BadRequestException);

      expect(dao.findOne).toHaveBeenCalledWith({ email: 'email' });
    });

    it('uses dao to update user', async () => {
      jest.spyOn(dao, 'findOne').mockResolvedValue(null);
      jest.spyOn(dao, 'update').mockResolvedValue(user);

      await service.update(user, partial);

      expect(dao.update).toHaveBeenCalledWith(user, partial);
    });

    it('returns updated user', async () => {
      jest.spyOn(dao, 'findOne').mockResolvedValue(null);
      jest.spyOn(dao, 'create').mockResolvedValue(user);

      const result = await service.create(partial);

      expect(result).toEqual(user);
    });
  });

  describe('destroy', () => {
    it('uses dao to delete selected user', async () => {
      await service.destroy(user);

      expect(dao.destroy).toHaveBeenCalledWith(user);
    });

    it('returns deleted user', async () => {
      const result = await service.destroy(user);

      expect(result).toEqual(user);
    });
  });
});
