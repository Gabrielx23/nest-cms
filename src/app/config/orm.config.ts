import { SequelizeModuleOptions } from '@nestjs/sequelize';
import { User } from '../../user/database/models/user.model';

export const sequelizeModuleOptions: SequelizeModuleOptions = {
  dialect: 'mysql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  models: [User],
};
