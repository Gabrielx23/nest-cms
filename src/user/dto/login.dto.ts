import { IsEmail, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDTO {
  @ApiProperty({ example: 'john.doe@hotmail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'testtest' })
  @MinLength(8)
  password: string;
}
