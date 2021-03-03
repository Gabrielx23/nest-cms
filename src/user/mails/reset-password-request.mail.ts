import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { UserInterface } from '../database/models/user.interface';
import { EnvKeyEnum } from '../../app/enum/env-key.enum';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class ResetPasswordRequestMail {
  public static templateName = 'resetPasswordRequest';

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
    private readonly i18n: I18nService,
  ) {}

  public async send(to: UserInterface, resetURL: string, language: string): Promise<void> {
    const translateOptions = { lang: language };
    await this.mailerService.sendMail({
      to: to.email,
      from: await this.configService.get(EnvKeyEnum.EmailFrom),
      subject: await this.i18n.translate('emails.test', translateOptions),
      template: ResetPasswordRequestMail.templateName,
      context: {
        resetURL: resetURL,
        header: await this.i18n.translate('emails.test', translateOptions),
        footer: await this.i18n.translate('emails.test', translateOptions),
      },
    });
  }
}
