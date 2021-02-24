import { Column, Model, Table } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { UserInterface } from './user.interface';
import { RoleEnum } from '../../enum/role.enum';

@Table
export class User extends Model<User> implements UserInterface {
  @ApiProperty({ example: '91e56daf-04ef-4bbc-abe7-5d3a8ee41101' })
  public id!: string;

  @ApiProperty({ example: 'John Doe' })
  @Column
  public name: string;

  @ApiProperty({ example: 'john.doe@gmail.com' })
  @Column
  public email: string;

  @ApiProperty({ example: RoleEnum.user })
  @Column
  public role: RoleEnum;

  @ApiProperty({ example: 'password' })
  @Exclude({ toPlainOnly: true })
  @Column
  public password: string;

  @Exclude({ toPlainOnly: true })
  @Column
  public token: string | null;

  @ApiProperty({ example: '2020-08-10T05:59:36.708Z' })
  @Column
  public createdAt: Date;

  @ApiProperty({ example: '2020-08-10T05:59:36.708Z' })
  @Column
  public updatedAt: Date;
}
