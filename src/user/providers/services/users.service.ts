import { Injectable } from '@nestjs/common';
import { UserDAO } from '../../database/dao/user.dao';
import { User } from '../../database/models/user.model';
import { UserException } from '../../exceptions/user.exception';
import { UserInterface } from '../../database/models/user.interface';
import * as Cryptr from 'cryptr';
import { ConfigService } from '@nestjs/config';
import { EnvKeyEnum } from '../../../app/enum/env-key.enum';
import { ResetPasswordRequestMail } from '../../mails/reset-password-request.mail';
import { ResetPasswordMail } from '../../mails/reset-password.mail';
import { SettingsGateway } from '../../../settings/providers/gateways/settings.gateway';
import { SettingNamesEnum } from '../../../settings/enum/setting-names.enum';

@Injectable()
export class UsersService {
  constructor(
    private readonly userDAO: UserDAO,
    private readonly configService: ConfigService,
    private readonly resetPasswordRequestMail: ResetPasswordRequestMail,
    private readonly resetPasswordMail: ResetPasswordMail,
    private readonly settingsGateway: SettingsGateway,
  ) {}

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

  public async resetPasswordRequest(user: UserInterface): Promise<void> {
    const frontURL = this.configService.get(EnvKeyEnum.FrontURLResetPassword);

    const cryptr = new Cryptr(this.configService.get(EnvKeyEnum.CryptSecret));

    const encrypted = cryptr.encrypt(`${user.email}"${new Date()}`);

    const url = `${frontURL}?${encrypted};`;

    const language = await this.settingsGateway.getSettingByName(SettingNamesEnum.language);

    await this.resetPasswordRequestMail.send(user, url, language.value);
  }

  public async adminResetPassword(
    user: UserInterface,
    password: string,
    hashedPassword: string,
  ): Promise<void> {
    await this.userDAO.update(user as User, { password: hashedPassword });

    const language = await this.settingsGateway.getSettingByName(SettingNamesEnum.language);

    await this.resetPasswordMail.send(user, password, language.value);
  }

  public async resetPassword(
    token: string,
    password: string,
    hashedPassword: string,
  ): Promise<void> {
    const cryptr = new Cryptr(this.configService.get(EnvKeyEnum.CryptSecret));

    const encrypted = cryptr.decrypt(token);

    const tokenData = encrypted.split('"');

    const user = await this.userDAO.findOne({ email: tokenData[0] });

    if (!user) {
      throw UserException.userNotExist();
    }

    await this.userDAO.update(user as User, { password: hashedPassword });

    const language = await this.settingsGateway.getSettingByName(SettingNamesEnum.language);

    await this.resetPasswordMail.send(user, password, language.value);
  }
}
