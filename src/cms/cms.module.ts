import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Page } from './database/models/page.model';
import { providers } from './providers';
import { PageDAO } from './database/dao/page.dao';
import { controllers } from './controllers';
import { UserModule } from '../user/user.module';
import { Slugger } from '../app/utils/slugger';
import { CategoryDAO } from './database/dao/category.dao';
import { Category } from './database/models/category.model';

@Module({
  imports: [SequelizeModule.forFeature([Page, Category]), UserModule],
  controllers: [...controllers],
  providers: [...providers, PageDAO, CategoryDAO, Slugger],
  exports: [SequelizeModule],
})
export class CMSModule {}
