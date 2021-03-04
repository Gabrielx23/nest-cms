import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { UserInterface } from '../database/models/user.interface';
import { EnvKeyEnum } from '../../app/enum/env-key.enum';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class ResetPasswordMail {
  public static templateName = 'resetPassword';

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
    private readonly i18n: I18nService,
  ) {}

  public async send(to: UserInterface, password: string, language: string): Promise<void> {
    const translateOptions = { lang: language };
    await this.mailerService.sendMail({
      to: to.email,
      from: await this.configService.get(EnvKeyEnum.EmailFrom),
      subject: await this.i18n.translate('emails.reset-password-subject', translateOptions),
      template: ResetPasswordMail.templateName,
      context: {
        password: password,
        header: await this.i18n.translate('emails.reset-password-header', translateOptions),
        footer: await this.i18n.translate('emails.reset-password-footer', translateOptions),
      },
    });
  }
}
