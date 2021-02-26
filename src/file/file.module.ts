import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { providers } from './providers';
import { controllers } from './controllers';
import { File } from './database/models/file.model';
import { FileDAO } from './database/dao/file.dao';
import { UserModule } from '../user/user.module';

@Module({
  imports: [SequelizeModule.forFeature([File]), UserModule],
  controllers: [...controllers],
  providers: [...providers, FileDAO],
  exports: [SequelizeModule],
})
export class FileModule {}
