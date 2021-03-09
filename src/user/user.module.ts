import { forwardRef, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { providers } from './providers';
import { controllers } from './controllers';
import { mails } from './mails';
import { User } from './database/models/user.model';
import { UserDAO } from './database/dao/user.dao';
import { AuthGuard } from './providers/auth.guard';
import { AuthService } from './providers/services/auth.service';
import { SettingModule } from '../settings/setting.module';

@Module({
  imports: [SequelizeModule.forFeature([User]), forwardRef(() => SettingModule)],
  controllers: [...controllers],
  providers: [...providers, ...mails, UserDAO],
  exports: [SequelizeModule, AuthGuard, AuthService],
})
export class UserModule {}
