import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PasswordResetRequestDTO {
  @ApiProperty({ example: 'john.doe@hotmail.com' })
  @IsEmail()
  email: string;
}
