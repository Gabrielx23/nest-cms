import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, MaxLength } from 'class-validator';

export class FileDTO {
  @ApiProperty({ example: 'Some file' })
  @MaxLength(250)
  @IsOptional()
  title: string;
}
