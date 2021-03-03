import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PasswordResetDTO {
  @ApiProperty({ example: 'd66768d833c5079925dfffd2f19bf50c74a0' })
  @IsString()
  token: string;
}
