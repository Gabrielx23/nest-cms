import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { providers } from './providers';
import { controllers } from './controllers';
import { Setting } from './database/models/setting.model';
import { SettingDAO } from './database/dao/setting.dao';
import { UserModule } from '../user/user.module';

@Module({
  imports: [SequelizeModule.forFeature([Setting]), UserModule],
  controllers: [...controllers],
  providers: [...providers, SettingDAO],
  exports: [SequelizeModule],
})
export class SettingModule {}
