import { MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDTO {
  @ApiProperty({ example: 'testtest' })
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'oldoldold' })
  @MinLength(8)
  oldPassword: string;
}
