import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { UserInterface } from '../database/models/user.interface';
import { EnvKeyEnum } from '../../app/enum/env-key.enum';
import { I18nService } from 'nestjs-i18n';
import { SettingsGateway } from '../../settings/providers/gateways/settings.gateway';
import { SettingNamesEnum } from '../../settings/enum/setting-names.enum';

@Injectable()
export class ResetPasswordMail {
  public static templateName = 'resetPassword';

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
    private readonly i18n: I18nService,
    private readonly settingsGateway: SettingsGateway,
  ) {}

  public async send(to: UserInterface, password: string): Promise<void> {
    const language = await this.settingsGateway.getSettingByName(SettingNamesEnum.language);

    const translateOptions = { lang: language.value };

    const email = await this.settingsGateway.getSettingByName(SettingNamesEnum.email);

    await this.mailerService.sendMail({
      to: to.email,
      from: email.value,
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
