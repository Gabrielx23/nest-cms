import { Test } from '@nestjs/testing';
import { PagesService } from './pages.service';
import { PageDAO } from '../../database/dao/page.dao';
import { PageInterface } from '../../database/models/page.interface';
import { Slugger } from '../../../app/utils/slugger';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';
import { Paginator } from '../../../app/utils/paginator';

const pageDAOMock = () => ({
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

const page: PageInterface = {
  id: 'id',
  name: 'Page name',
  slug: 'page-name',
  content: '<b>something</b>',
  publishedAt: new Date(),
};

describe('PagesService', () => {
  let service: PagesService, dao: PageDAO, slugger: Slugger, configService: ConfigService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        { provide: PageDAO, useFactory: pageDAOMock },
        { provide: Slugger, useFactory: sluggerMock },
        { provide: ConfigService, useFactory: configServiceMock },
      ],
    }).compile();

    dao = await module.resolve(PageDAO);
    slugger = await module.resolve(Slugger);
    configService = await module.resolve(ConfigService);
    service = new PagesService(dao, slugger, configService);
  });

  describe('destroy', () => {
    it('uses dao to destroy selected page', async () => {
      await service.destroy(page);

      expect(dao.destroy).toHaveBeenCalledWith(page);
    });
  });

  describe('update', () => {
    const toUpdate = { name: 'different name', slug: 'also different slug' };

    it('uses dao to update given page', async () => {
      await service.update(page, toUpdate);

      expect(dao.update).toHaveBeenCalledWith(page, toUpdate);
    });

    it('returns updated page', async () => {
      jest.spyOn(dao, 'update').mockResolvedValue(page);

      const result = await service.update(page, {
        name: 'different name',
        slug: 'also different slug',
      });

      expect(result).toEqual(page);
    });
  });

  describe('create', () => {
    it('uses dao to create page', async () => {
      await service.create(page);

      expect(dao.create).toHaveBeenCalledWith(page);
    });

    it('returns created page', async () => {
      jest.spyOn(dao, 'create').mockResolvedValue(page);

      const result = await service.create(page);

      expect(result).toEqual(page);
    });
  });

  describe('getOne', () => {
    const condition = { id: page.id };

    it('uses dao to obtain page', async () => {
      await service.getOne(condition);

      expect(dao.findOne).toHaveBeenCalledWith(condition);
    });

    it('returns obtained page', async () => {
      jest.spyOn(dao, 'findOne').mockResolvedValue(page);

      const result = await service.getOne(condition);

      expect(result).toEqual(page);
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

    it('returns paginated pages', async () => {
      jest.spyOn(dao, 'findAll').mockResolvedValue({ count: 1, rows: [page] });
      jest.spyOn(dao, 'countAll').mockResolvedValue(5);

      const result = await service.getAll(options);

      expect(result).toEqual(
        Paginator.paginate({ page: 1, limit: 10 }, { count: 1, totalCount: 5, rows: [page] }),
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
