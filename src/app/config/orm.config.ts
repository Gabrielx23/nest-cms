import { SequelizeModuleOptions } from '@nestjs/sequelize';
import { Page } from '../../cms/database/models/page.model';
import { User } from '../../user/database/models/user.model';
import { Category } from '../../cms/database/models/category.model';
import { File } from '../../file/database/models/file.model';
import { PageCategory } from '../../cms/database/models/page-category.model';
import { Setting } from '../../settings/database/models/setting.model';

export const sequelizeModuleOptions: SequelizeModuleOptions = {
  dialect: 'mysql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  models: [User, Page, Category, File, PageCategory, Setting],
};
