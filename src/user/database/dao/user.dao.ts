import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../models/user.model';
import { Persister } from '../../../app/utils/persister';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import { UserInterface } from '../models/user.interface';

@Injectable()
export class UserDAO {
  constructor(
    @InjectModel(User)
    private readonly userModel: typeof User,
  ) {}

  public async update(user: User, partial: Partial<User>): Promise<UserInterface> {
    user = Persister.persist(user, partial);

    return await user.save();
  }

  public async findAll(): Promise<UserInterface[]> {
    return await this.userModel.findAll({ raw: true });
  }

  public async findOne(condition: object, raw = false): Promise<UserInterface> {
    return await this.userModel.findOne({
      raw,
      where: condition,
    });
  }

  public async destroy(user: User): Promise<void> {
    await user.destroy();
  }

  public async create(partial: Partial<User>) {
    const user = Persister.persist(new this.userModel(), partial);

    user.id = randomStringGenerator();

    return await user.save();
  }
}
