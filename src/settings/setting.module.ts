import { forwardRef, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { providers } from './providers';
import { controllers } from './controllers';
import { Setting } from './database/models/setting.model';
import { SettingDAO } from './database/dao/setting.dao';
import { UserModule } from '../user/user.module';
import { SettingsGateway } from './providers/gateways/settings.gateway';

@Module({
  imports: [SequelizeModule.forFeature([Setting]), forwardRef(() => UserModule)],
  controllers: [...controllers],
  providers: [...providers, SettingDAO],
  exports: [SequelizeModule, SettingsGateway],
})
export class SettingModule {}
