import { Injectable } from '@nestjs/common';
import { PageDAO } from '../../database/dao/page.dao';
import { Page } from '../../database/models/page.model';
import { Slugger } from '../../../app/utils/slugger';
import { PageInterface } from '../../database/models/page.interface';
import { PageException } from '../../exceptions/page.exception';
import { PaginationOptionsInterface } from '../../../app/interfaces/pagination-options.interface';
import { Paginator } from '../../../app/utils/paginator';
import { PaginationResponseDTO } from '../../../app/dto/pagination-response.dto';
import { ConfigService } from '@nestjs/config';
import { EnvKeyEnum } from '../../../app/enum/env-key.enum';

@Injectable()
export class PagesService {
  constructor(
    private readonly pageDAO: PageDAO,
    private readonly slugger: Slugger,
    private readonly configService: ConfigService,
  ) {}

  public async getAll(
    options: PaginationOptionsInterface,
    conditions?: object,
  ): Promise<PaginationResponseDTO> {
    const pages = await this.pageDAO.findAll(options, conditions);

    const totalCount = await this.pageDAO.countAll();

    return Paginator.paginate(options, { totalCount, ...pages });
  }

  public async getOne(conditions: object): Promise<PageInterface> {
    return await this.pageDAO.findOne(conditions);
  }

  public async generateSlug(name: string): Promise<string> {
    const slug = this.slugger.slug(name);
    let iterator = 0;

    while (iterator < parseInt(this.configService.get(EnvKeyEnum.MaxSlugGenerateAttempts))) {
      const tmpSlug = `${slug}-${++iterator}`;

      if (!(await this.pageDAO.findOne({ slug: iterator === 1 ? slug : tmpSlug }))) {
        return iterator === 1 ? slug : tmpSlug;
      }
    }

    throw PageException.tooManyGenerateSlugAttempts();
  }

  public async create(partial: Partial<Page>): Promise<PageInterface> {
    return await this.pageDAO.create(partial);
  }

  public async update(page: PageInterface, partial: Partial<Page>): Promise<PageInterface> {
    return await this.pageDAO.update(page as Page, partial);
  }

  public async destroy(page: PageInterface): Promise<void> {
    await this.pageDAO.destroy(page as Page);
  }
}
