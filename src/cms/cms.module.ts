import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Page } from './database/models/page.model';
import { providers } from './providers';
import { PageDAO } from './database/dao/page.dao';
import { controllers } from './controllers';
import { UserModule } from '../user/user.module';
import { Slugger } from '../app/utils/slugger';

@Module({
  imports: [SequelizeModule.forFeature([Page]), UserModule],
  controllers: [...controllers],
  providers: [...providers, PageDAO, Slugger],
  exports: [SequelizeModule],
})
export class CMSModule {}
