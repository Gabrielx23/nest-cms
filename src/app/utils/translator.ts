import { I18nService, translateOptions } from 'nestjs-i18n';
import { Injectable } from '@nestjs/common';
import { SettingsService } from '../../settings/providers/services/settings.service';
import { SettingNamesEnum } from '../../settings/enum/setting-names.enum';

@Injectable()
export class Translator {
  constructor(
    private readonly settingsService: SettingsService,
    private readonly i18n: I18nService,
  ) {}

  public async translate(key: string, translateOptions: translateOptions | null): Promise<string> {
    if (!translateOptions) {
      translateOptions = { lang: '' };
    }

    if (!translateOptions.lang) {
      const langSetting = await this.settingsService.getOne({ name: SettingNamesEnum.language });
      translateOptions.lang = langSetting.value;
    }

    return await this.i18n.translate(key, translateOptions);
  }
}
