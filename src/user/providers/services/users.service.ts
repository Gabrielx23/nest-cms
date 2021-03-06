import { Injectable } from '@nestjs/common';
import { UserDAO } from '../../database/dao/user.dao';
import { User } from '../../database/models/user.model';
import { UserException } from '../../exceptions/user.exception';
import { UserInterface } from '../../database/models/user.interface';

@Injectable()
export class UsersService {
  constructor(private readonly userDAO: UserDAO) {}

  public async getAll(raw = false): Promise<Array<UserInterface>> {
    return await this.userDAO.findAll(raw);
  }

  public async getOne(conditions: object, raw = false): Promise<UserInterface> {
    const user = await this.userDAO.findOne(conditions, raw);

    if (user && raw) {
      const { password, token, ...userData } = user;
      return userData;
    }

    return user;
  }

  public async create(partial: Partial<User>): Promise<UserInterface> {
    if (await this.userDAO.findOne({ email: partial.email })) {
      throw UserException.credentialsAlreadyInUse();
    }

    return await this.userDAO.create(partial);
  }

  public async update(
    user: UserInterface,
    partial: Partial<UserInterface>,
  ): Promise<UserInterface> {
    const userByEmail = partial.email ? await this.userDAO.findOne({ email: partial.email }) : null;

    if (userByEmail && userByEmail.id !== user.id) {
      throw UserException.credentialsAlreadyInUse();
    }

    return await this.userDAO.update(user as User, partial);
  }

  public async destroy(user: UserInterface): Promise<UserInterface> {
    await this.userDAO.destroy(user as User);

    return user;
  }
}
