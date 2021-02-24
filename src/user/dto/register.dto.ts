import { IsEmail, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDTO {
  @ApiProperty({ example: 'John Doe' })
  @MinLength(3)
  name: string;

  @ApiProperty({ example: 'john.doe@hotmail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'testtest' })
  @MinLength(8)
  password: string;
}
