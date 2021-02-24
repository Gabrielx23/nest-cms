import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { providers } from './providers';
import { controllers } from './controllers';

@Module({
  imports: [SequelizeModule.forFeature([])],
  controllers: [...controllers],
  providers: [...providers],
  exports: [SequelizeModule],
})
export class FileModule {}
