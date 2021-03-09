import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Persister } from '../../../app/utils/persister';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import { PageCategory } from '../models/page-category.model';
import { PageCategoryInterface } from '../models/page-category.interface';

@Injectable()
export class PageCategoryDAO {
  constructor(
    @InjectModel(PageCategory)
    private pageCategoryModel: typeof PageCategory,
  ) {}

  public async destroy(pageId: string): Promise<void> {
    await PageCategory.destroy({ where: { pageId } });
  }

  public async create(partial: Partial<PageCategory>): Promise<PageCategoryInterface> {
    const pageCategory = Persister.persist(new this.pageCategoryModel(), partial);

    pageCategory.setDataValue('id', randomStringGenerator());

    return await pageCategory.save({ fields: ['id', 'categoryId', 'pageId'] });
  }
}
