import { BelongsTo, Column, ForeignKey, Model, Table } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { Page } from './page.model';
import { Category } from './category.model';
import { PageCategoryInterface } from './page-category.interface';

@Table
export class PageCategory extends Model<PageCategory> implements PageCategoryInterface {
  @ApiProperty({ example: '91e56daf-04ef-4bbc-abe7-5d3a8ee41101' })
  public id!: string;

  @ApiProperty({ example: '91e56daf-04ef-4bbc-abe7-5d3a8ee41101' })
  @ForeignKey(() => Category)
  @Column
  public categoryId!: string;

  @BelongsTo(() => Category)
  public category: Category;

  @ApiProperty({ example: '91e56daf-04ef-4bbc-abe7-5d3a8ee41101' })
  @ForeignKey(() => Page)
  @Column
  public pageId!: string;

  @BelongsTo(() => Page)
  public page: Page;

  @ApiProperty({ example: '2020-08-10T05:59:36.708Z' })
  @Column
  public createdAt: Date;

  @ApiProperty({ example: '2020-08-10T05:59:36.708Z' })
  @Column
  public updatedAt: Date;
}
