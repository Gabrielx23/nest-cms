import { Injectable } from '@nestjs/common';
import { FileDAO } from '../../database/dao/file.dao';
import { File } from '../../database/models/file.model';
import { FileInterface } from '../../database/models/file.interface';
import { PaginationOptionsInterface } from '../../../app/interfaces/pagination-options.interface';
import { PaginationResponseDTO } from '../../../app/dto/pagination-response.dto';
import { Paginator } from '../../../app/utils/paginator';

@Injectable()
export class FilesService {
  constructor(private readonly fileDAO: FileDAO) {}

  public async getAll(
    options: PaginationOptionsInterface,
    conditions?: object,
  ): Promise<PaginationResponseDTO> {
    const files = await this.fileDAO.findAll(options, conditions);

    const totalCount = await this.fileDAO.countAll();

    return Paginator.paginate(options, { totalCount, ...files });
  }

  public async getOne(conditions: object, raw = false): Promise<FileInterface> {
    return await this.fileDAO.findOne(conditions, raw);
  }

  public async create(partial: Partial<File>): Promise<FileInterface> {
    return await this.fileDAO.create(partial);
  }

  public async update(
    file: FileInterface,
    partial: Partial<FileInterface>,
  ): Promise<FileInterface> {
    return await this.fileDAO.update(file as File, partial);
  }

  public async destroy(file: FileInterface): Promise<FileInterface> {
    await this.fileDAO.destroy(file as File);

    return file;
  }
}
