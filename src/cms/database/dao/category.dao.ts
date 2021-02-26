import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Persister } from '../../../app/utils/persister';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import { PaginationOptionsInterface } from '../../../app/interfaces/pagination-options.interface';
import { PaginationResponseInterface } from '../../../app/interfaces/pagination-response.interface';
import { Category } from '../models/category.model';
import { CategoryInterface } from '../models/category.interface';

@Injectable()
export class CategoryDAO {
  constructor(
    @InjectModel(Category)
    private categoryModel: typeof Category,
  ) {}

  public async update(category: Category, partial: Partial<Category>): Promise<CategoryInterface> {
    category = Persister.persist(category, partial);

    return await category.save();
  }

  public async findAll(
    options: PaginationOptionsInterface,
    conditions?: object,
  ): Promise<PaginationResponseInterface> {
    return await this.categoryModel.findAndCountAll({
      limit: options.limit,
      offset: (options.page - 1) * options.limit,
      where: conditions || {},
    });
  }

  public async countAll(): Promise<number> {
    return await this.categoryModel.count();
  }

  public async findOne(condition: object): Promise<CategoryInterface> {
    return await this.categoryModel.findOne({
      where: condition,
    });
  }

  public async destroy(category: Category): Promise<void> {
    await category.destroy();
  }

  public async create(partial: Partial<Category>): Promise<CategoryInterface> {
    const category = Persister.persist(new this.categoryModel(), partial);

    category.id = randomStringGenerator();

    return await category.save();
  }
}
