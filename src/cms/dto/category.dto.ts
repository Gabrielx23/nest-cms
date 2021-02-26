import { IsOptional, MaxLength, MinLength, Matches, IsUUID, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CategoryDTO {
  @IsString()
  @MinLength(3)
  @MaxLength(253)
  @ApiProperty({ example: 'category name' })
  name: string;

  @IsOptional()
  @IsString()
  @Matches('^[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*$')
  @MaxLength(255)
  @ApiProperty({ example: 'category-name' })
  slug: string;

  @IsOptional()
  @IsUUID()
  @ApiProperty({ example: '91e56daf-04ef-4bbc-abe7-5d3a8ee41101' })
  categoryId: string;
}
