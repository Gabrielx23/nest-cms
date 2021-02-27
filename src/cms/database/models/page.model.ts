import { BelongsTo, BelongsToMany, Column, ForeignKey, Model, Table } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { PageInterface } from './page.interface';
import { PageTemplateTypeEnum } from '../../enum/page-template-type.enum';
import { User } from '../../../user/database/models/user.model';
import { PageCategory } from './page-category.model';
import { Category } from './category.model';

@Table
export class Page extends Model<Page> implements PageInterface {
  @ApiProperty({ example: '91e56daf-04ef-4bbc-abe7-5d3a8ee41101' })
  public id!: string;

  @ApiProperty({ example: 'Page name' })
  @Column
  public name: string;

  @ApiProperty({ example: '<b>content</b>' })
  @Column
  public content: string;

  @ApiProperty({ example: true })
  @Column
  public isPage!: boolean;

  @ApiProperty({ example: '2020-08-10T05:59:36.708Z' })
  @Column
  public publishedAt: Date;

  @ApiProperty({ example: PageTemplateTypeEnum.basic })
  @Column
  public template!: PageTemplateTypeEnum;

  @ApiProperty({ example: 'page-slug' })
  @Column
  public slug!: string;

  @ApiProperty({ example: '91e56daf-04ef-4bbc-abe7-5d3a8ee41101' })
  @ForeignKey(() => User)
  @Column
  public userId!: string;

  @BelongsTo(() => User)
  public user: User;

  @ApiProperty({ example: 'http://image.com' })
  @Column
  public thumbnail!: string;

  @ApiProperty({ example: 'Meta title' })
  @Column
  public metaTitle!: string;

  @ApiProperty({ example: 'Meta description' })
  @Column
  public metaDescription!: string;

  @BelongsToMany(() => Category, () => PageCategory)
  public categories: Category[];

  @ApiProperty({ example: '2020-08-10T05:59:36.708Z' })
  @Column
  public createdAt: Date;

  @ApiProperty({ example: '2020-08-10T05:59:36.708Z' })
  @Column
  public updatedAt: Date;
}
