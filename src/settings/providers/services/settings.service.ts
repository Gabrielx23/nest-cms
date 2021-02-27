import { Injectable } from '@nestjs/common';
import { SettingDAO } from '../../database/dao/setting.dao';
import { SettingInterface } from '../../database/models/setting.interface';
import { Setting } from '../../database/models/setting.model';

@Injectable()
export class SettingsService {
  constructor(private readonly settingDAO: SettingDAO) {}

  public async getAll(): Promise<Array<SettingInterface>> {
    return await this.settingDAO.findAll();
  }

  public async getOne(conditions: object): Promise<SettingInterface> {
    return await this.settingDAO.findOne(conditions);
  }

  public async update(
    setting: SettingInterface,
    partial: Partial<SettingInterface>,
  ): Promise<SettingInterface> {
    return await this.settingDAO.update(setting as Setting, partial);
  }
}
