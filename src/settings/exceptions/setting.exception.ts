import { NotFoundException } from '@nestjs/common';

export class SettingException {
  public static settingNotExist(): NotFoundException {
    return new NotFoundException('Setting not exist!');
  }
}
