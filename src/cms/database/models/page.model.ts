import { Model, Table } from 'sequelize-typescript';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Table
export class Page extends Model<Page> {
  @ApiProperty({ example: '91e56daf-04ef-4bbc-abe7-5d3a8ee41101' })
  public id: string;

  @ApiProperty({ example: 'Page name' })
  public name: string;

  @ApiProperty({ example: '<b>some</b>' })
  public content: string;

  @ApiPropertyOptional({ example: true })
  public isPage: boolean;

  @ApiProperty({ example: '2020-08-10T05:59:36.708Z' })
  public createdAt: Date;

  @ApiProperty({ example: '2020-08-10T05:59:36.708Z' })
  public updatedAt: Date;
}
