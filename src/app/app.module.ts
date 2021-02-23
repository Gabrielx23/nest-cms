import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { sequelizeModuleOptions } from './config/orm.config';
import { mainConfig } from './config/main.config';
import { CMSModule } from '../cms/cms.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [mainConfig] }),
    SequelizeModule.forRoot({ ...sequelizeModuleOptions }),
    CMSModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
