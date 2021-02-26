import { Injectable } from '@nestjs/common';
import { Slugger } from '../../../app/utils/slugger';
import { PaginationOptionsInterface } from '../../../app/interfaces/pagination-options.interface';
import { Paginator } from '../../../app/utils/paginator';
import { PaginationResponseDTO } from '../../../app/dto/pagination-response.dto';
import { ConfigService } from '@nestjs/config';
import { EnvKeyEnum } from '../../../app/enum/env-key.enum';
import { CategoryDAO } from '../../database/dao/category.dao';
import { CategoryInterface } from '../../database/models/category.interface';
import { Category } from '../../database/models/category.model';
import { CategoryException } from '../../exceptions/category.exception';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly categoryDAO: CategoryDAO,
    private readonly slugger: Slugger,
    private readonly configService: ConfigService,
  ) {}

  public async getAll(
    options: PaginationOptionsInterface,
    conditions?: object,
  ): Promise<PaginationResponseDTO> {
    const categories = await this.categoryDAO.findAll(options, conditions);

    const totalCount = await this.categoryDAO.countAll();

    return Paginator.paginate(options, { totalCount, ...categories });
  }

  public async getOne(conditions: object): Promise<CategoryInterface> {
    return await this.categoryDAO.findOne(conditions);
  }

  public async generateSlug(name: string): Promise<string> {
    const slug = this.slugger.slug(name);
    let iterator = 0;

    while (iterator < parseInt(this.configService.get(EnvKeyEnum.MaxSlugGenerateAttempts))) {
      const tmpSlug = `${slug}-${++iterator}`;

      if (!(await this.categoryDAO.findOne({ slug: iterator === 1 ? slug : tmpSlug }))) {
        return iterator === 1 ? slug : tmpSlug;
      }
    }

    throw CategoryException.tooManyGenerateSlugAttempts();
  }

  public async create(partial: Partial<Category>): Promise<CategoryInterface> {
    return await this.categoryDAO.create(partial);
  }

  public async update(
    category: CategoryInterface,
    partial: Partial<Category>,
  ): Promise<CategoryInterface> {
    return await this.categoryDAO.update(category as Category, partial);
  }

  public async destroy(category: CategoryInterface): Promise<void> {
    await this.categoryDAO.destroy(category as Category);
  }
}
