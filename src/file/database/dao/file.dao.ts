import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Persister } from '../../../app/utils/persister';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import { FileInterface } from '../models/file.interface';
import { File } from '../models/file.model';
import { PaginationOptionsInterface } from '../../../app/interfaces/pagination-options.interface';
import { PaginationResponseInterface } from '../../../app/interfaces/pagination-response.interface';

@Injectable()
export class FileDAO {
  constructor(
    @InjectModel(File)
    private readonly fileModel: typeof File,
  ) {}

  public async update(file: File, partial: Partial<File>): Promise<FileInterface> {
    file = Persister.persist(file, partial);

    return await file.save();
  }

  public async findAll(
    options: PaginationOptionsInterface,
    conditions?: object,
  ): Promise<PaginationResponseInterface> {
    return await this.fileModel.findAndCountAll({
      limit: options.limit,
      offset: (options.page - 1) * options.limit,
      where: conditions || {},
    });
  }

  public async countAll(): Promise<number> {
    return await this.fileModel.count();
  }

  public async findOne(condition: object, raw = false): Promise<FileInterface> {
    return await this.fileModel.findOne({
      raw,
      where: condition,
    });
  }

  public async destroy(user: File): Promise<void> {
    await user.destroy();
  }

  public async create(partial: Partial<File>) {
    const file = Persister.persist(new this.fileModel(), partial);

    file.id = randomStringGenerator();

    return await file.save();
  }
}
