import { Test } from '@nestjs/testing';
import { FileInterface } from '../../database/models/file.interface';
import { FilesService } from './files.service';
import { FileDAO } from '../../database/dao/file.dao';
import { Paginator } from '../../../app/utils/paginator';

const fileDAOMock = () => ({
  findOne: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
  countAll: jest.fn(),
});

const file: FileInterface = {
  mime: '',
  name: '',
  path: '',
};

describe('FileService', () => {
  let service: FilesService, dao: FileDAO;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [{ provide: FileDAO, useFactory: fileDAOMock }],
    }).compile();

    dao = await module.resolve(FileDAO);
    service = new FilesService(dao);
  });

  describe('getOne', () => {
    const condition = { id: 'id' };

    it('uses dao to obtain file', async () => {
      await service.getOne(condition);

      expect(dao.findOne).toHaveBeenCalledWith(condition, false);
    });

    it('returns obtained file', async () => {
      jest.spyOn(dao, 'findOne').mockResolvedValue(file);

      const result = await service.getOne(condition);

      expect(result).toEqual(file);
    });
  });

  describe('getAll', () => {
    const options = { page: 1, limit: 10 };

    it('uses dao to obtain all pages', async () => {
      await service.getAll(options);

      expect(dao.findAll).toHaveBeenCalledWith(options, undefined);
    });

    it('uses dao to obtain all pages count', async () => {
      await service.getAll(options);

      expect(dao.countAll).toHaveBeenCalled();
    });

    it('returns paginator response', async () => {
      jest.spyOn(dao, 'findAll').mockResolvedValue({ rows: [], count: 0 });
      jest.spyOn(dao, 'countAll').mockResolvedValue(0);

      const result = await service.getAll(options);

      expect(result).toEqual(Paginator.paginate(options, { totalCount: 0, rows: [], count: 0 }));
    });
  });

  describe('create', () => {
    it('uses dao to create file', async () => {
      await service.create(file);

      expect(dao.create).toHaveBeenCalledWith(file);
    });

    it('returns created page', async () => {
      jest.spyOn(dao, 'create').mockResolvedValue(file);

      const result = await service.create(file);

      expect(result).toEqual(file);
    });
  });

  describe('update', () => {
    const toUpdate = { title: 'title' };

    it('uses dao to update given file', async () => {
      await service.update(file, toUpdate);

      expect(dao.update).toHaveBeenCalledWith(file, toUpdate);
    });

    it('returns updated file', async () => {
      jest.spyOn(dao, 'update').mockResolvedValue(file);

      const result = await service.update(file, toUpdate);

      expect(result).toEqual(file);
    });
  });

  describe('destroy', () => {
    it('uses dao to destroy selected file', async () => {
      await service.destroy(file);

      expect(dao.destroy).toHaveBeenCalledWith(file);
    });
  });
});
