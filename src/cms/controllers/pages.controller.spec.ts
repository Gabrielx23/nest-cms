import { Test } from '@nestjs/testing';
import { PageInterface } from '../database/models/page.interface';
import { PagesService } from '../providers/services/pages.service';
import { PagesController } from './pages.controller';
import { PageDTO } from '../dto/page.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UserInterface } from '../../user/database/models/user.interface';
import { RoleEnum } from '../../user/enum/role.enum';
import { PaginationResponseDTO } from '../../app/dto/pagination-response.dto';
import { PaginationDTO } from '../../app/dto/pagination.dto';
import { Op } from 'sequelize';

const pagesServiceMock = () => ({
  update: jest.fn(),
  getOne: jest.fn(),
  create: jest.fn(),
  destroy: jest.fn(),
  getAll: jest.fn(),
  generateSlug: jest.fn(),
});

const page: PageInterface = {
  id: 'id',
  name: 'Page name',
  slug: 'page-name',
  content: '<b>something</b>',
  publishedAt: new Date(),
};

const user: UserInterface = {
  id: 'id',
  name: 'name',
  email: 'email@mail.com',
  role: RoleEnum.administrator,
};

const pagination: PaginationResponseDTO = {
  page: 1,
  limit: 10,
  count: 5,
  totalCount: 15,
  rows: [page],
};

describe('PagesController', () => {
  let pagesService: PagesService, controller: PagesController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [{ provide: PagesService, useFactory: pagesServiceMock }],
    }).compile();

    pagesService = await module.get(PagesService);
    controller = new PagesController(pagesService);
  });

  describe('create', () => {
    const dto = new PageDTO();
    dto.slug = 'slug';

    it('throws exception if slug already exist', async () => {
      jest.spyOn(pagesService, 'getOne').mockResolvedValue(page);

      await expect(controller.create(dto, user)).rejects.toThrow(BadRequestException);
    });

    it('uses pages service to create new page', async () => {
      await controller.create(dto, user);

      expect(pagesService.create).toHaveBeenCalledWith({ ...dto, userId: user.id });
    });

    it('returns created page', async () => {
      jest.spyOn(pagesService, 'create').mockResolvedValue(page);

      const result = await controller.create(dto, user);

      expect(result).toEqual(page);
    });
  });

  describe('update', () => {
    const dto = new PageDTO();

    it('throws exception if page is not found', async () => {
      await expect(controller.update(dto, page.id)).rejects.toThrow(NotFoundException);
    });

    it('throws exception if slug already exist', async () => {
      const differentPage = { ...page, slug: 'different-slug' };
      dto.slug = page.slug;

      jest.spyOn(pagesService, 'getOne').mockResolvedValueOnce(page);
      jest.spyOn(pagesService, 'getOne').mockResolvedValueOnce(differentPage);

      await expect(controller.update(dto, page.id)).rejects.toThrow(BadRequestException);
    });

    it('uses pages service to update page', async () => {
      jest.spyOn(pagesService, 'getOne').mockResolvedValue(page);

      await controller.update(dto, page.id);

      expect(pagesService.update).toHaveBeenCalledWith(page, dto);
    });

    it('returns updated page', async () => {
      jest.spyOn(pagesService, 'getOne').mockResolvedValue(page);
      jest.spyOn(pagesService, 'update').mockResolvedValue(page);

      const result = await controller.update(dto, page.id);

      expect(result).toEqual(page);
    });
  });

  describe('delete', () => {
    it('throws exception if page not exist', async () => {
      await expect(controller.delete(page.id)).rejects.toThrow(NotFoundException);
    });

    it('uses pages service to delete page', async () => {
      jest.spyOn(pagesService, 'getOne').mockResolvedValue(page);

      await controller.delete(page.id);

      expect(pagesService.destroy).toHaveBeenCalledWith(page);
    });

    it('returns deleted page', async () => {
      jest.spyOn(pagesService, 'getOne').mockResolvedValue(page);

      const result = await controller.delete(page.id);

      expect(result).toEqual(page);
    });
  });

  describe('previewAll', () => {
    const paginationDTO = new PaginationDTO();
    const search = 'search';

    it('uses pages service to obtain all paginated pages', async () => {
      jest.spyOn(pagesService, 'getAll').mockResolvedValue(pagination);

      await controller.previewAll(paginationDTO, search);

      expect(pagesService.getAll).toHaveBeenCalledWith(paginationDTO, {
        name: { [Op.like]: `%${search}%` },
      });
    });

    it('returns obtained pages', async () => {
      jest.spyOn(pagesService, 'getAll').mockResolvedValue(pagination);

      const result = await controller.previewAll(paginationDTO);

      expect(result).toEqual(pagination);
    });
  });

  describe('preview', () => {
    it('uses pages service to obtain page', async () => {
      jest.spyOn(pagesService, 'getOne').mockResolvedValue(page);

      await controller.preview(page.id);

      expect(pagesService.getOne).toHaveBeenCalledWith({ id: page.id });
    });

    it('returns obtained page', async () => {
      jest.spyOn(pagesService, 'getOne').mockResolvedValue(page);

      const result = await controller.preview(page.id);

      expect(result).toEqual(page);
    });
  });

  describe('getAll', () => {
    const paginationDTO = new PaginationDTO();

    it('uses pages service to obtain all published pages with pagination', async () => {
      jest.spyOn(pagesService, 'getAll').mockResolvedValue(pagination);

      await controller.getAll(paginationDTO);

      expect(pagesService.getAll).toHaveBeenCalledWith(paginationDTO, {
        publishedAt: { [Op.not]: null },
      });
    });

    it('returns obtained pages', async () => {
      jest.spyOn(pagesService, 'getAll').mockResolvedValue(pagination);

      const result = await controller.getAll(paginationDTO);

      expect(result).toEqual(pagination);
    });
  });

  describe('getOne', () => {
    it('throws exception if page not exist or is not published', async () => {
      await expect(controller.getOne(page.id)).rejects.toThrow(NotFoundException);
    });

    it('uses pages service to obtain published page', async () => {
      jest.spyOn(pagesService, 'getOne').mockResolvedValue(page);

      await controller.getOne(page.id);

      expect(pagesService.getOne).toHaveBeenCalledWith({ id: page.id });
    });

    it('returns obtained page', async () => {
      jest.spyOn(pagesService, 'getOne').mockResolvedValue(page);

      const result = await controller.getOne(page.id);

      expect(result).toEqual(page);
    });
  });

  describe('togglePublishedStatus', () => {
    it('throws exception if page not exist', async () => {
      await expect(controller.togglePublishedStatus(page.id)).rejects.toThrow(NotFoundException);
    });

    it('uses pages service to update publishedAt status', async () => {
      jest.spyOn(pagesService, 'getOne').mockResolvedValue(page);

      await controller.togglePublishedStatus(page.id);

      expect(pagesService.update).toHaveBeenCalledWith(page, { publishedAt: null });
    });

    it('returns page with updated publishedAt status', async () => {
      jest.spyOn(pagesService, 'getOne').mockResolvedValue(page);
      jest.spyOn(pagesService, 'update').mockResolvedValue(page);

      const result = await controller.togglePublishedStatus(page.id);

      expect(result).toEqual(page);
    });
  });
});
