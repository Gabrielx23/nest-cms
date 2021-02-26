import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiTags,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import {
  Body,
  Controller,
  Post,
  Get,
  UsePipes,
  ValidationPipe,
  UseGuards,
  Query,
  Param,
  ParseUUIDPipe,
  Delete,
  Put,
} from '@nestjs/common';
import { AuthGuard } from '../../user/providers/auth.guard';
import { PageException } from '../exceptions/page.exception';
import { PaginationDTO } from '../../app/dto/pagination.dto';
import { PaginationResponseDTO } from '../../app/dto/pagination-response.dto';
import { CategoriesService } from '../providers/services/categories.service';
import { CategoryInterface } from '../database/models/category.interface';
import { Category } from '../database/models/category.model';
import { CategoryDTO } from '../dto/category.dto';
import { CategoryException } from '../exceptions/category.exception';

@ApiTags('Category')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post('/')
  @UseGuards(AuthGuard)
  @UsePipes(ValidationPipe)
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: Category })
  @ApiBadRequestResponse()
  @ApiForbiddenResponse()
  @ApiUnauthorizedResponse()
  public async create(@Body() categoryDTO: CategoryDTO): Promise<CategoryInterface> {
    if (categoryDTO.slug && !!(await this.categoriesService.getOne({ slug: categoryDTO.slug }))) {
      throw CategoryException.slugAlreadyExist();
    }

    if (
      categoryDTO.categoryId &&
      !(await this.categoriesService.getOne({ id: categoryDTO.categoryId }))
    ) {
      throw CategoryException.parentCategoryNotExist();
    }

    const slug = categoryDTO.slug ?? (await this.categoriesService.generateSlug(categoryDTO.name));

    const category = { ...categoryDTO, slug };

    return await this.categoriesService.create(category);
  }

  @Put('/:id')
  @UseGuards(AuthGuard)
  @UsePipes(ValidationPipe)
  @ApiBearerAuth()
  @ApiOkResponse({ type: Category })
  @ApiBadRequestResponse()
  @ApiForbiddenResponse()
  @ApiUnauthorizedResponse()
  public async update(
    @Body() categoryDTO: CategoryDTO,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<CategoryInterface> {
    const page = await this.categoriesService.getOne({ id });

    if (!page) {
      throw CategoryException.categoryNotExist();
    }

    if (
      categoryDTO.categoryId &&
      !(await this.categoriesService.getOne({ id: categoryDTO.categoryId }))
    ) {
      throw CategoryException.parentCategoryNotExist();
    }

    const categoryBySlug = categoryDTO.slug
      ? await this.categoriesService.getOne({ slug: categoryDTO.slug })
      : null;

    if (categoryBySlug && categoryBySlug.slug !== page.slug) {
      throw CategoryException.slugAlreadyExist();
    }

    return await this.categoriesService.update(page, categoryDTO);
  }

  @Get('/')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOkResponse({ type: PaginationResponseDTO })
  public async getAll(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query() paginateDTO: PaginationDTO,
  ): Promise<PaginationResponseDTO> {
    return await this.categoriesService.getAll(paginateDTO);
  }

  @Get('/:id')
  @ApiOkResponse({ type: Category })
  public async getOne(@Param('id', new ParseUUIDPipe()) id: string): Promise<CategoryInterface> {
    return await this.categoriesService.getOne({ id });
  }

  @Delete('/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: Category })
  @ApiNotFoundResponse()
  @ApiForbiddenResponse()
  @ApiUnauthorizedResponse()
  public async delete(@Param('id', new ParseUUIDPipe()) id: string): Promise<CategoryInterface> {
    const category = await this.categoriesService.getOne({ id });

    if (!category) {
      throw CategoryException.categoryNotExist();
    }

    await this.categoriesService.destroy(category);

    return category;
  }
}
