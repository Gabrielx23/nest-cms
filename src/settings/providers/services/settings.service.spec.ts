import { Test } from '@nestjs/testing';
import { SettingInterface } from '../../database/models/setting.interface';
import { SettingsService } from './settings.service';
import { SettingDAO } from '../../database/dao/setting.dao';
import { SettingsNamesEnum } from '../../enum/settings-names.enum';
import { LanguageEnum } from '../../enum/language.enum';

const settingDAOMock = () => ({
  findOne: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
});

const setting: SettingInterface = {
  id: 'id',
  name: 'language',
  value: 'en',
};

describe('SettingsService', () => {
  let service: SettingsService, dao: SettingDAO;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [{ provide: SettingDAO, useFactory: settingDAOMock }],
    }).compile();

    dao = await module.resolve(SettingDAO);
    service = new SettingsService(dao);
  });

  describe('update', () => {
    const toUpdate = { name: SettingsNamesEnum.language, value: LanguageEnum.pl };

    it('uses dao to update given setting', async () => {
      await service.update(setting, toUpdate);

      expect(dao.update).toHaveBeenCalledWith(setting, toUpdate);
    });

    it('returns updated setting', async () => {
      jest.spyOn(dao, 'update').mockResolvedValue(setting);

      const result = await service.update(setting, toUpdate);

      expect(result).toEqual(setting);
    });
  });

  describe('getOne', () => {
    const condition = { id: setting.id };

    it('uses dao to obtain setting', async () => {
      await service.getOne(condition);

      expect(dao.findOne).toHaveBeenCalledWith(condition);
    });

    it('returns obtained setting', async () => {
      jest.spyOn(dao, 'findOne').mockResolvedValue(setting);

      const result = await service.getOne(condition);

      expect(result).toEqual(setting);
    });
  });

  describe('getAll', () => {
    it('uses dao to obtain all settings', async () => {
      await service.getAll();

      expect(dao.findAll).toHaveBeenCalled();
    });

    it('returns obtained settings', async () => {
      jest.spyOn(dao, 'findAll').mockResolvedValue([setting]);

      const result = await service.getAll();

      expect(result).toEqual([setting]);
    });
  });
});
