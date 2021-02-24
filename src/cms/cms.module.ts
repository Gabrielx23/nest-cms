import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Page } from './database/models/page.model';

@Module({
  imports: [SequelizeModule.forFeature([Page])],
  exports: [SequelizeModule],
})
export class CMSModule {}
