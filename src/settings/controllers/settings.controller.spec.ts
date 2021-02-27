import { Test } from '@nestjs/testing';
import { SettingInterface } from '../database/models/setting.interface';
import { SettingsService } from '../providers/services/settings.service';
import { SettingsController } from './settings.controller';
import { SettingDTO } from '../dto/setting.dto';
import { LanguageEnum } from '../enum/language.enum';
import { SettingsNamesEnum } from '../enum/settings-names.enum';
import { NotFoundException } from '@nestjs/common';

const settingsServiceMock = () => ({
  update: jest.fn(),
  getOne: jest.fn(),
  getAll: jest.fn(),
});

const setting: SettingInterface = {
  id: 'id',
  name: 'language',
  value: 'en',
};

describe('SettingsController', () => {
  let settingsService: SettingsService, controller: SettingsController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [{ provide: SettingsService, useFactory: settingsServiceMock }],
    }).compile();

    settingsService = await module.get(SettingsService);
    controller = new SettingsController(settingsService);
  });

  describe('update', () => {
    const dto = new SettingDTO();

    it('uses settings service to update settings', async () => {
      const settingName = SettingsNamesEnum.language;
      dto[settingName] = LanguageEnum.fr;
      jest.spyOn(settingsService, 'getOne').mockResolvedValue(setting);

      await controller.update(dto);

      expect(settingsService.update).toHaveBeenCalledWith(setting, {
        name: settingName,
        value: dto.language,
      });
    });

    it('returns all settings', async () => {
      jest.spyOn(settingsService, 'getAll').mockResolvedValue([setting]);

      const result = await controller.update(dto);

      expect(result).toEqual([setting]);
    });
  });

  describe('getAll', () => {
    it('uses settings service to obtain all settings', async () => {
      jest.spyOn(settingsService, 'getAll').mockResolvedValue([setting]);

      await controller.getAll();

      expect(settingsService.getAll).toHaveBeenCalledWith();
    });

    it('returns obtained settings', async () => {
      jest.spyOn(settingsService, 'getAll').mockResolvedValue([setting]);

      const result = await controller.getAll();

      expect(result).toEqual([setting]);
    });
  });

  describe('getOne', () => {
    it('throws exception if setting not exist', async () => {
      await expect(controller.getOne(setting.id)).rejects.toThrow(NotFoundException);
    });

    it('uses settings service to obtain setting', async () => {
      jest.spyOn(settingsService, 'getOne').mockResolvedValue(setting);

      await controller.getOne(setting.id);

      expect(settingsService.getOne).toHaveBeenCalledWith({ id: setting.id });
    });

    it('returns obtained setting', async () => {
      jest.spyOn(settingsService, 'getOne').mockResolvedValue(setting);

      const result = await controller.getOne(setting.id);

      expect(result).toEqual(setting);
    });
  });

  describe('getOneByName', () => {
    it('throws exception if setting not exist', async () => {
      await expect(controller.getOneByName(setting.id)).rejects.toThrow(NotFoundException);
    });

    it('uses settings service to obtain setting by name', async () => {
      jest.spyOn(settingsService, 'getOne').mockResolvedValue(setting);

      await controller.getOneByName(setting.name);

      expect(settingsService.getOne).toHaveBeenCalledWith({ name: setting.name });
    });

    it('returns obtained setting', async () => {
      jest.spyOn(settingsService, 'getOne').mockResolvedValue(setting);

      const result = await controller.getOneByName(setting.name);

      expect(result).toEqual(setting);
    });
  });
});
