import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiTags,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiQuery,
} from '@nestjs/swagger';
import {
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Delete,
  Get,
  Patch,
  UsePipes,
  ValidationPipe,
  UseGuards,
  Query,
} from '@nestjs/common';
import { PageDTO } from '../dto/page.dto';
import { PagesService } from '../providers/services/pages.service';
import { AuthGuard } from '../../user/providers/auth.guard';
import { Page } from '../database/models/page.model';
import { LoggedUser } from '../../user/decorators/logged-user.decorator';
import { UserInterface } from '../../user/database/models/user.interface';
import { PageInterface } from '../database/models/page.interface';
import { PageException } from '../exceptions/page.exception';
import { PaginationDTO } from '../../app/dto/pagination.dto';
import { Op } from 'sequelize';
import { PaginationResponseDTO } from '../../app/dto/pagination-response.dto';

@ApiTags('Page')
@Controller('pages')
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Post('/')
  @UseGuards(AuthGuard)
  @UsePipes(ValidationPipe)
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: Page })
  @ApiBadRequestResponse()
  @ApiForbiddenResponse()
  @ApiUnauthorizedResponse()
  public async create(
    @Body() pageDTO: PageDTO,
    @LoggedUser() user: UserInterface,
  ): Promise<PageInterface> {
    if (pageDTO.slug && !!(await this.pagesService.getOne({ slug: pageDTO.slug }))) {
      throw PageException.slugAlreadyExist();
    }

    const slug = pageDTO.slug ?? (await this.pagesService.generateSlug(pageDTO.name));

    const page = { ...pageDTO, slug, userId: user.id };

    return await this.pagesService.create(page);
  }

  @Put('/:id')
  @UseGuards(AuthGuard)
  @UsePipes(ValidationPipe)
  @ApiBearerAuth()
  @ApiOkResponse({ type: Page })
  @ApiBadRequestResponse()
  @ApiForbiddenResponse()
  @ApiUnauthorizedResponse()
  public async update(
    @Body() pageDTO: PageDTO,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<PageInterface> {
    const page = await this.pagesService.getOne({ id });

    if (!page) {
      throw PageException.pageNotExist();
    }

    const pageBySlug = pageDTO.slug ? await this.pagesService.getOne({ slug: pageDTO.slug }) : null;

    if (pageBySlug && pageBySlug.slug !== page.slug) {
      throw PageException.slugAlreadyExist();
    }

    return await this.pagesService.update(page, pageDTO);
  }

  @Delete('/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: Page })
  @ApiNotFoundResponse()
  @ApiForbiddenResponse()
  @ApiUnauthorizedResponse()
  public async delete(@Param('id', new ParseUUIDPipe()) id: string): Promise<PageInterface> {
    const page = await this.pagesService.getOne({ id });

    if (!page) {
      throw PageException.pageNotExist();
    }

    await this.pagesService.destroy(page);

    return page;
  }

  @Get('/preview')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiQuery({ name: 'limit' })
  @ApiQuery({ name: 'page' })
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOkResponse({ type: PaginationResponseDTO })
  @ApiForbiddenResponse()
  @ApiUnauthorizedResponse()
  public async previewAll(@Query() paginateDTO: PaginationDTO): Promise<PaginationResponseDTO> {
    return await this.pagesService.getAll(paginateDTO);
  }

  @Get('/preview/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: Page })
  @ApiForbiddenResponse()
  @ApiUnauthorizedResponse()
  public async preview(@Param('id', new ParseUUIDPipe()) id: string): Promise<PageInterface> {
    return await this.pagesService.getOne({ id });
  }

  @Get('/')
  @ApiQuery({ name: 'limit' })
  @ApiQuery({ name: 'page' })
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOkResponse({ type: PaginationResponseDTO })
  public async getAll(@Query() paginateDTO: PaginationDTO): Promise<PaginationResponseDTO> {
    return await this.pagesService.getAll(paginateDTO, { publishedAt: { [Op.not]: null } });
  }

  @Get('/:id')
  @ApiOkResponse({ type: Page })
  public async getOne(@Param('id', new ParseUUIDPipe()) id: string): Promise<PageInterface> {
    const page = await this.pagesService.getOne({ id });

    if (!page || !page.publishedAt) {
      throw PageException.pageNotExist();
    }

    return page;
  }

  @Patch('publishedAt/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: Page })
  @ApiForbiddenResponse()
  @ApiUnauthorizedResponse()
  @ApiNotFoundResponse()
  public async togglePublishedStatus(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<PageInterface> {
    const page = await this.pagesService.getOne({ id });

    if (!page) {
      throw PageException.pageNotExist();
    }

    return await this.pagesService.update(page, {
      publishedAt: page.publishedAt ? null : new Date(),
    });
  }
}
