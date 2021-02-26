import { Test } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PaginationResponseDTO } from '../../app/dto/pagination-response.dto';
import { PaginationDTO } from '../../app/dto/pagination.dto';
import { CategoryInterface } from '../database/models/category.interface';
import { CategoriesService } from '../providers/services/categories.service';
import { CategoriesController } from './categories.controller';
import { CategoryDTO } from '../dto/category.dto';
import { Op } from 'sequelize';

const categoriesServiceMock = () => ({
  update: jest.fn(),
  getOne: jest.fn(),
  create: jest.fn(),
  destroy: jest.fn(),
  getAll: jest.fn(),
  generateSlug: jest.fn(),
});

const category: CategoryInterface = {
  id: 'id',
  name: 'Category name',
  slug: 'category-name',
};

const pagination: PaginationResponseDTO = {
  page: 1,
  limit: 10,
  count: 5,
  totalCount: 15,
  rows: [category],
};

describe('CategoriesController', () => {
  let categoriesService: CategoriesService, controller: CategoriesController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [{ provide: CategoriesService, useFactory: categoriesServiceMock }],
    }).compile();

    categoriesService = await module.get(CategoriesService);
    controller = new CategoriesController(categoriesService);
  });

  describe('create', () => {
    const dto = new CategoryDTO();
    dto.slug = 'slug';

    it('uses categories service to create new category', async () => {
      await controller.create(dto);

      expect(categoriesService.create).toHaveBeenCalledWith(dto);
    });

    it('returns created category', async () => {
      jest.spyOn(categoriesService, 'create').mockResolvedValue(category);

      const result = await controller.create(dto);

      expect(result).toEqual(category);
    });

    it('throws exception if slug already exist', async () => {
      jest.spyOn(categoriesService, 'getOne').mockResolvedValueOnce(category);

      await expect(controller.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('throws exception if parent category not exist', async () => {
      dto.categoryId = category.id;

      jest.spyOn(categoriesService, 'getOne').mockResolvedValue(undefined);

      await expect(controller.create(dto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const dto = new CategoryDTO();

    it('throws exception if slug already exist', async () => {
      const differentCategory = { ...category, slug: 'different-slug' };
      dto.slug = category.slug;

      jest.spyOn(categoriesService, 'getOne').mockResolvedValueOnce(category);
      jest.spyOn(categoriesService, 'getOne').mockResolvedValueOnce(differentCategory);

      await expect(controller.update(dto, category.id)).rejects.toThrow(BadRequestException);
    });

    it('uses categories service to update category', async () => {
      jest.spyOn(categoriesService, 'getOne').mockResolvedValue(category);

      await controller.update(dto, category.id);

      expect(categoriesService.update).toHaveBeenCalledWith(category, dto);
    });

    it('returns updated category', async () => {
      jest.spyOn(categoriesService, 'getOne').mockResolvedValue(category);
      jest.spyOn(categoriesService, 'update').mockResolvedValue(category);

      const result = await controller.update(dto, category.id);

      expect(result).toEqual(category);
    });

    it('throws exception if category is not found', async () => {
      await expect(controller.update(dto, category.id)).rejects.toThrow(NotFoundException);
    });

    it('throws exception if parent category has the same id', async () => {
      dto.categoryId = category.id;

      jest.spyOn(categoriesService, 'getOne').mockResolvedValueOnce(category);
      jest.spyOn(categoriesService, 'getOne').mockResolvedValueOnce(undefined);

      await expect(controller.update(dto, category.id)).rejects.toThrow(BadRequestException);
    });

    it('throws exception if parent category not exist', async () => {
      dto.categoryId = 'some different id';

      jest.spyOn(categoriesService, 'getOne').mockResolvedValueOnce(category);
      jest.spyOn(categoriesService, 'getOne').mockResolvedValueOnce(undefined);

      await expect(controller.update(dto, category.id)).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('throws exception if category does not exist', async () => {
      await expect(controller.delete(category.id)).rejects.toThrow(NotFoundException);
    });

    it('uses categories service to delete category', async () => {
      jest.spyOn(categoriesService, 'getOne').mockResolvedValue(category);

      await controller.delete(category.id);

      expect(categoriesService.destroy).toHaveBeenCalledWith(category);
    });

    it('returns deleted category', async () => {
      jest.spyOn(categoriesService, 'getOne').mockResolvedValue(category);

      const result = await controller.delete(category.id);

      expect(result).toEqual(category);
    });
  });

  describe('getAll', () => {
    const paginationDTO = new PaginationDTO();

    it('uses categories service to obtain all categories with pagination', async () => {
      jest.spyOn(categoriesService, 'getAll').mockResolvedValue(pagination);

      await controller.getAll(paginationDTO, category.name);

      expect(categoriesService.getAll).toHaveBeenCalledWith(paginationDTO, {
        name: { [Op.like]: `%${category.name}%` },
      });
    });

    it('returns obtained categories', async () => {
      jest.spyOn(categoriesService, 'getAll').mockResolvedValue(pagination);

      const result = await controller.getAll(paginationDTO);

      expect(result).toEqual(pagination);
    });
  });

  describe('getOne', () => {
    it('throws exception if category not exist', async () => {
      await expect(controller.getOne(category.id)).rejects.toThrow(NotFoundException);
    });

    it('uses categories service to obtain category', async () => {
      jest.spyOn(categoriesService, 'getOne').mockResolvedValue(category);

      await controller.getOne(category.id);

      expect(categoriesService.getOne).toHaveBeenCalledWith({ id: category.id });
    });

    it('returns obtained category', async () => {
      jest.spyOn(categoriesService, 'getOne').mockResolvedValue(category);

      const result = await controller.getOne(category.id);

      expect(result).toEqual(category);
    });
  });

  describe('getChildren', () => {
    const paginationDTO = new PaginationDTO();

    it('throws exception if category does not exist', async () => {
      await expect(controller.getChildren(paginationDTO, category.id)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('uses categories service to obtain category children', async () => {
      jest.spyOn(categoriesService, 'getOne').mockResolvedValue(category);
      jest.spyOn(categoriesService, 'getAll').mockResolvedValueOnce(pagination);

      await controller.getChildren(paginationDTO, category.id);

      expect(categoriesService.getOne).toHaveBeenCalledWith({ id: category.id });
      expect(categoriesService.getAll).toHaveBeenCalledWith(paginationDTO, {
        categoryId: category.id,
      });
    });

    it('returns obtained category children', async () => {
      jest.spyOn(categoriesService, 'getOne').mockResolvedValue(category);
      jest.spyOn(categoriesService, 'getAll').mockResolvedValue(pagination);

      const result = await controller.getChildren(paginationDTO, category.id);

      expect(result).toEqual(pagination);
    });
  });
});
