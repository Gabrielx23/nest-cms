import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '../../user/providers/auth.guard';
import { File } from '../database/models/file.model';
import { FileInterface } from '../database/models/file.interface';
import { FileInterceptor } from '@nestjs/platform-express';
import { filesConfig } from '../files.config';
import { FileDTO } from '../dto/file.dto';
import { FileException } from '../exceptions/file.exception';
import { FileSystemService } from '../providers/services/file-system.service';
import { FilesService } from '../providers/services/files.service';
import { PaginationResponseDTO } from '../../app/dto/pagination-response.dto';
import { PaginationDTO } from '../../app/dto/pagination.dto';
import { Op } from 'sequelize';

@ApiTags('File')
@Controller('files')
export class FilesController {
  constructor(
    private readonly fileSystemService: FileSystemService,
    private readonly filesService: FilesService,
  ) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file', filesConfig))
  @UsePipes(ValidationPipe)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: 'multipart/form-data',
    required: true,
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        title: { type: 'string' },
      },
    },
  })
  @ApiCreatedResponse({ type: File })
  @ApiBadRequestResponse()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  public async upload(@UploadedFile() file, @Body() dto: FileDTO): Promise<FileInterface> {
    if (!file) {
      throw FileException.fileNotSent();
    }

    dto.title = (dto.title || file.originalname).toLowerCase();

    await this.filesService.create({
      ...dto,
      path: file.path,
      mime: file.mimetype,
      name: file.originalname,
    });

    return await this.filesService.getOne({ path: file.path }, true);
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOkResponse({ type: File })
  @ApiNotFoundResponse()
  @ApiForbiddenResponse()
  @ApiUnauthorizedResponse()
  public async update(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: FileDTO) {
    const file = await this.filesService.getOne({ id });

    if (!file) {
      throw FileException.fileNotExist();
    }

    await this.filesService.update(file, dto);

    return file;
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOkResponse({ type: File })
  @ApiNotFoundResponse()
  @ApiForbiddenResponse()
  @ApiUnauthorizedResponse()
  public async delete(@Param('id', new ParseUUIDPipe()) id: string) {
    const file = await this.filesService.getOne({ id });

    if (!file) {
      throw FileException.fileNotExist();
    }

    await this.filesService.destroy(file);
    await this.fileSystemService.deleteIfExist(`./${file.path}`);

    return file;
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOkResponse({ type: File })
  @ApiNotFoundResponse()
  @ApiForbiddenResponse()
  @ApiUnauthorizedResponse()
  public async getOne(@Param('id', new ParseUUIDPipe()) id: string) {
    const file = await this.filesService.getOne({ id });

    if (!file) {
      throw FileException.fileNotExist();
    }

    return file;
  }

  @Get(':year/:month/:day/:fileName')
  @ApiOkResponse()
  @ApiNotFoundResponse()
  public async download(
    @Param('year') year: string,
    @Param('month') month: string,
    @Param('day') day: string,
    @Param('fileName') fileName: string,
    @Res() res,
  ) {
    const path = `files/${year}/${month}/${day}`;
    const fileRecord = await this.filesService.getOne({ path: `${path}/${fileName}` });

    if (!fileRecord) {
      throw FileException.fileNotExist();
    }

    return res.sendFile(fileName, { root: path });
  }

  @Get('/')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiQuery({ name: 'page', required: false, allowEmptyValue: true })
  @ApiQuery({ name: 'limit', required: false, allowEmptyValue: true })
  @ApiQuery({ name: 'search', required: false, allowEmptyValue: true })
  @ApiOkResponse({ type: PaginationResponseDTO })
  @ApiForbiddenResponse()
  @ApiUnauthorizedResponse()
  public async getAll(
    @Query() paginateDTO: PaginationDTO,
    @Query('search') search?: string,
  ): Promise<PaginationResponseDTO> {
    const conditions = search ? { title: { [Op.like]: `%${search}%` } } : undefined;

    return await this.filesService.getAll(paginateDTO, conditions);
  }
}
