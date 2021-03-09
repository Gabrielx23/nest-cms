import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Page } from '../models/page.model';
import { Persister } from '../../../app/utils/persister';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import { PageInterface } from '../models/page.interface';
import { PaginationOptionsInterface } from '../../../app/interfaces/pagination-options.interface';
import { PaginationResponseInterface } from '../../../app/interfaces/pagination-response.interface';

@Injectable()
export class PageDAO {
  constructor(
    @InjectModel(Page)
    private pageModel: typeof Page,
  ) {}

  public async update(page: Page, partial: Partial<Page>): Promise<PageInterface> {
    page = Persister.persist(page, partial);

    return await page.save();
  }

  public async findAll(
    options: PaginationOptionsInterface,
    conditions?: object,
  ): Promise<PaginationResponseInterface> {
    return await this.pageModel.findAndCountAll({
      limit: options.limit,
      offset: (options.page - 1) * options.limit,
      include: [
        {
          association: 'user',
          attributes: { exclude: ['password', 'token'] },
        },
        {
          association: 'categories',
          through: { attributes: [] },
        },
      ],
      where: conditions || {},
    });
  }

  public async countAll(): Promise<number> {
    return await this.pageModel.count();
  }

  public async findOne(condition: object): Promise<PageInterface> {
    return await this.pageModel.findOne({
      where: condition,
      include: [
        {
          association: 'user',
          attributes: { exclude: ['password', 'token'] },
        },
        {
          association: 'categories',
          through: { attributes: [] },
        },
      ],
    });
  }

  public async destroy(page: Page): Promise<void> {
    await page.destroy();
  }

  public async create(partial: Partial<Page>): Promise<PageInterface> {
    const page = Persister.persist(new this.pageModel(), partial);

    page.id = randomStringGenerator();

    return await page.save();
  }
}
