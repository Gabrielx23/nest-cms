import { IsEmail, IsEnum, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RoleEnum } from '../enum/role.enum';

export class UpdateUserDTO {
  @ApiProperty({ example: 'John Doe' })
  @MinLength(3)
  name: string;

  @ApiProperty({ example: 'john.doe@hotmail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: RoleEnum.user })
  @IsEnum(RoleEnum)
  role: RoleEnum;
}
