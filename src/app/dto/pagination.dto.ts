import { IsOptional, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class PaginationDTO {
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  @ApiProperty({ example: 1 })
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  @ApiProperty({ example: 10 })
  limit = 10;
}
