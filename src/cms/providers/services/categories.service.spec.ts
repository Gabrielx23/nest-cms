import { Test } from '@nestjs/testing';
import { Slugger } from '../../../app/utils/slugger';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';
import { Paginator } from '../../../app/utils/paginator';
import { CategoryInterface } from '../../database/models/category.interface';
import { CategoriesService } from './categories.service';
import { CategoryDAO } from '../../database/dao/category.dao';

const categoryDAOMock = () => ({
  findOne: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
  countAll: jest.fn(),
});

const sluggerMock = () => ({
  slug: jest.fn(),
});

const configServiceMock = () => ({
  get: jest.fn(),
});

const category: CategoryInterface = {
  id: 'id',
  name: 'Category name',
  slug: 'category-name',
};

describe('CategoriesService', () => {
  let service: CategoriesService, dao: CategoryDAO, slugger: Slugger, configService: ConfigService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        { provide: CategoryDAO, useFactory: categoryDAOMock },
        { provide: Slugger, useFactory: sluggerMock },
        { provide: ConfigService, useFactory: configServiceMock },
      ],
    }).compile();

    dao = await module.resolve(CategoryDAO);
    slugger = await module.resolve(Slugger);
    configService = await module.resolve(ConfigService);
    service = new CategoriesService(dao, slugger, configService);
  });

  describe('destroy', () => {
    it('uses dao to destroy selected category', async () => {
      await service.destroy(category);

      expect(dao.destroy).toHaveBeenCalledWith(category);
    });
  });

  describe('update', () => {
    const toUpdate = { name: 'different name', slug: 'also different slug' };

    it('uses dao to update given category', async () => {
      await service.update(category, toUpdate);

      expect(dao.update).toHaveBeenCalledWith(category, toUpdate);
    });

    it('returns updated category', async () => {
      jest.spyOn(dao, 'update').mockResolvedValue(category);

      const result = await service.update(category, toUpdate);

      expect(result).toEqual(category);
    });
  });

  describe('create', () => {
    it('uses dao to create category', async () => {
      await service.create(category);

      expect(dao.create).toHaveBeenCalledWith(category);
    });

    it('returns created category', async () => {
      jest.spyOn(dao, 'create').mockResolvedValue(category);

      const result = await service.create(category);

      expect(result).toEqual(category);
    });
  });

  describe('getOne', () => {
    const condition = { id: category.id };

    it('uses dao to obtain category', async () => {
      await service.getOne(condition);

      expect(dao.findOne).toHaveBeenCalledWith(condition);
    });

    it('returns obtained category', async () => {
      jest.spyOn(dao, 'findOne').mockResolvedValue(category);

      const result = await service.getOne(condition);

      expect(result).toEqual(category);
    });
  });

  describe('getAll', () => {
    const options = { page: 1, limit: 10 };

    it('uses dao to obtain all categories', async () => {
      await service.getAll(options);

      expect(dao.findAll).toHaveBeenCalledWith(options, undefined);
    });

    it('uses dao to obtain all categories count', async () => {
      await service.getAll(options);

      expect(dao.countAll).toHaveBeenCalled();
    });

    it('returns paginated categories', async () => {
      jest.spyOn(dao, 'findAll').mockResolvedValue({ count: 1, rows: [category] });
      jest.spyOn(dao, 'countAll').mockResolvedValue(5);

      const result = await service.getAll(options);

      expect(result).toEqual(
        Paginator.paginate({ page: 1, limit: 10 }, { count: 1, totalCount: 5, rows: [category] }),
      );
    });
  });

  describe('generateSlug', () => {
    const slug = 'slug';

    it('generates slug from given string', async () => {
      jest.spyOn(configService, 'get').mockReturnValue(50);
      jest.spyOn(slugger, 'slug').mockReturnValue(slug);

      const result = await service.generateSlug(slug);

      expect(result).toEqual(slug);
    });

    it('throws exception if slug was generated too many times', async () => {
      jest.spyOn(configService, 'get').mockReturnValue(0);

      await expect(service.generateSlug(slug)).rejects.toThrow(BadRequestException);
    });
  });
});
