import { Column, Model, Table } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { SettingInterface } from './setting.interface';
import { SettingNamesEnum } from '../../enum/setting-names.enum';

@Table
export class Setting extends Model<Setting> implements SettingInterface {
  @ApiProperty({ example: '91e56daf-04ef-4bbc-abe7-5d3a8ee41101' })
  public id!: string;

  @ApiProperty({ example: SettingNamesEnum.language })
  @Column
  public name: string;

  @ApiProperty({ example: 'en' })
  @Column
  public value: string;

  @ApiProperty({ example: '2020-08-10T05:59:36.708Z' })
  @Column
  public createdAt: Date;

  @ApiProperty({ example: '2020-08-10T05:59:36.708Z' })
  @Column
  public updatedAt: Date;
}
