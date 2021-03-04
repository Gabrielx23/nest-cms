import { Injectable } from '@nestjs/common';
import { SettingsService } from '../services/settings.service';
import { SettingInterface } from '../../database/models/setting.interface';

@Injectable()
export class SettingsGateway {
  constructor(private readonly settingsService: SettingsService) {}

  public async getSettingByName(name: string): Promise<SettingInterface> {
    return await this.settingsService.getOne({ name });
  }
}
