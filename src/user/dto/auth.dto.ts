import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AuthDTO {
  @ApiProperty({ example: '1eabab32-5487-64d2-bb6f-0a002700000c' })
  @IsString()
  token: string;

  @ApiProperty({ example: '3600s' })
  @IsString()
  tokenExpiresIn: string;

  @ApiProperty({ example: '1eabab32-5487-64d2-bb6f-0a002700000c' })
  @IsString()
  refreshToken: string;

  @ApiProperty({ example: '7200s' })
  @IsString()
  refreshTokenExpiresIn: string;
}
