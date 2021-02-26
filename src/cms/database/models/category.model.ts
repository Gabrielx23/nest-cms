import { BelongsTo, Column, ForeignKey, Model, Table } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { CategoryInterface } from './category.interface';

@Table
export class Category extends Model<Category> implements CategoryInterface {
  @ApiProperty({ example: '91e56daf-04ef-4bbc-abe7-5d3a8ee41101' })
  public id!: string;

  @ApiProperty({ example: 'Category name' })
  @Column
  public name: string;

  @ApiProperty({ example: 'category-slug' })
  @Column
  public slug!: string;

  @ApiProperty({ example: '91e56daf-04ef-4bbc-abe7-5d3a8ee41101' })
  @ForeignKey(() => Category)
  @Column
  public categoryId!: string;

  @BelongsTo(() => Category)
  public category: Category;

  @ApiProperty({ example: '2020-08-10T05:59:36.708Z' })
  @Column
  public createdAt: Date;

  @ApiProperty({ example: '2020-08-10T05:59:36.708Z' })
  @Column
  public updatedAt: Date;
}
