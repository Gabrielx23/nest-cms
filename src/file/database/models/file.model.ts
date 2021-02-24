import { Column, Model, Table } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { FileInterface } from './file.interface';

@Table
export class File extends Model<File> implements FileInterface {
  @ApiProperty({ example: '91e56daf-04ef-4bbc-abe7-5d3a8ee41101' })
  public id!: string;

  @ApiProperty({ example: 'File title' })
  @Column
  public title: string;

  @ApiProperty({ example: 'file.jpg' })
  @Column
  public name: string;

  @ApiProperty({ example: 'image/jpeg' })
  @Column
  public mime: string;

  @ApiProperty({ example: '/files/02-01-2021/file.jpg' })
  @Column
  public path: string;

  @ApiProperty({ example: '2020-08-10T05:59:36.708Z' })
  @Column
  public createdAt: Date;

  @ApiProperty({ example: '2020-08-10T05:59:36.708Z' })
  @Column
  public updatedAt: Date;
}
