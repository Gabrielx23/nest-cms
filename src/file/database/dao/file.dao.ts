import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Persister } from '../../../app/utils/persister';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import { FileInterface } from '../models/file.interface';
import { File } from '../models/file.model';

@Injectable()
export class FileDao {
  constructor(
    @InjectModel(File)
    private readonly fileModel: typeof File,
  ) {}

  public async update(file: File, partial: Partial<File>): Promise<FileInterface> {
    file = Persister.persist(file, partial);

    return await file.save();
  }

  public async findAll(raw = false): Promise<FileInterface[]> {
    return await this.fileModel.findAll({
      raw,
    });
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
