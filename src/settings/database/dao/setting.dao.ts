import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Setting } from '../models/setting.model';
import { Persister } from '../../../app/utils/persister';
import { SettingInterface } from '../models/setting.interface';

@Injectable()
export class SettingDAO {
  constructor(
    @InjectModel(Setting)
    private readonly settingModel: typeof Setting,
  ) {}

  public async update(setting: Setting, partial: Partial<Setting>): Promise<SettingInterface> {
    setting = Persister.persist(setting, partial);

    return await setting.save();
  }

  public async findAll(): Promise<Array<SettingInterface>> {
    return await this.settingModel.findAll();
  }

  public async findOne(condition: object): Promise<SettingInterface> {
    return await this.settingModel.findOne({
      where: condition,
    });
  }
}
