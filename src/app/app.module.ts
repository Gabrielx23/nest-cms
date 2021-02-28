import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { sequelizeModuleOptions } from './config/orm.config';
import { mainConfig } from './config/main.config';
import { CMSModule } from '../cms/cms.module';
import { UserModule } from '../user/user.module';
import { FileModule } from '../file/file.module';
import { I18nJsonParser, I18nModule } from 'nestjs-i18n';
import { join } from 'path';
import { SettingModule } from '../settings/setting.module';
import { LanguageEnum } from '../settings/enum/language.enum';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [mainConfig] }),
    SequelizeModule.forRoot({ ...sequelizeModuleOptions }),
    UserModule,
    CMSModule,
    FileModule,
    SettingModule,
    I18nModule.forRoot({
      fallbackLanguage: LanguageEnum.en,
      parser: I18nJsonParser,
      parserOptions: {
        path: join(__dirname, '/i18n/'),
        watch: true,
      },
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
