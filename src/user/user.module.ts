import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { providers } from './providers';
import { controllers } from './controllers';
import { User } from './database/models/user.model';
import { UserDAO } from './database/dao/user.dao';

@Module({
  imports: [SequelizeModule.forFeature([User])],
  controllers: [...controllers],
  providers: [...providers, UserDAO],
  exports: [SequelizeModule],
})
export class UserModule {}
