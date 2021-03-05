import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { UserInterface } from '../database/models/user.interface';
import { I18nService } from 'nestjs-i18n';
import { SettingsGateway } from '../../settings/providers/gateways/settings.gateway';
import { SettingNamesEnum } from '../../settings/enum/setting-names.enum';

@Injectable()
export class ResetPasswordRequestMail {
  public static templateName = 'resetPasswordRequest';

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
    private readonly i18n: I18nService,
    private readonly settingsGateway: SettingsGateway,
  ) {}

  public async send(to: UserInterface, resetURL: string): Promise<void> {
    const language = await this.settingsGateway.getSettingByName(SettingNamesEnum.language);

    const translateOptions = { lang: language.value, args: { email: to.email } };

    const email = await this.settingsGateway.getSettingByName(SettingNamesEnum.email);

    await this.mailerService.sendMail({
      to: to.email,
      from: email.value,
      subject: await this.i18n.translate('emails.reset-password-request-subject', translateOptions),
      template: ResetPasswordRequestMail.templateName,
      context: {
        resetURL: resetURL,
        confirmation: await this.i18n.translate('emails.reset-password-confirm', translateOptions),
        header: await this.i18n.translate('emails.reset-password-request-header', translateOptions),
        footer: await this.i18n.translate('emails.reset-password-request-footer', translateOptions),
      },
    });
  }
}
