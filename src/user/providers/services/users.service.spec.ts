import { Test } from '@nestjs/testing';
import { UserDAO } from '../../database/dao/user.dao';
import { UserInterface } from '../../database/models/user.interface';
import { UsersService } from './users.service';
import { BadRequestException } from '@nestjs/common';

const userDAOMock = () => ({
  findOne: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
});

const user: UserInterface = { email: '', name: '', password: '' };

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

      expect(dao.findOne).toBeCalledWith({ id: 'id' });
      expect(result).toEqual(user);
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
      const user2: UserInterface = { id: 'id', email: '', name: '', password: '' };

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
