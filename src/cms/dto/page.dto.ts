import {
  IsString,
  IsOptional,
  MaxLength,
  MinLength,
  IsNumber,
  IsDateString,
  Matches,
  IsUrl,
  IsEnum,
  IsArray,
} from 'class-validator';
import { PageTemplateTypeEnum } from '../enum/page-template-type.enum';
import { ApiProperty } from '@nestjs/swagger';

export class PageDTO {
  @MinLength(3)
  @MaxLength(253)
  @ApiProperty({ example: 'page name' })
  name: string;

  @IsString()
  @ApiProperty({ example: '<b>something</b>' })
  content: string;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ example: 1 })
  isPage: boolean;

  @IsOptional()
  @IsDateString()
  @ApiProperty({ example: '2020-08-10T05:59:36.708Z' })
  publishedAt: Date;

  @IsOptional()
  @Matches('^[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*$')
  @MaxLength(255)
  @ApiProperty({ example: 'page-name' })
  slug: string;

  @IsOptional()
  @IsString()
  @IsEnum(PageTemplateTypeEnum)
  @ApiProperty({ example: PageTemplateTypeEnum.basic })
  template: PageTemplateTypeEnum;

  @IsOptional()
  @IsUrl()
  @MaxLength(65535)
  @ApiProperty({ example: 'https://photo.com/photo/photo.jpg' })
  thumbnail: string;

  @IsOptional()
  @MaxLength(255)
  @ApiProperty({ example: 'Meta title' })
  metaTitle: string;

  @IsOptional()
  @MaxLength(255)
  @ApiProperty({ example: 'Meta description' })
  metaDescription: string;

  @IsOptional()
  @IsArray()
  @ApiProperty({
    example: ['91e56daf-04ef-4bbc-abe7-5d3a8ee41101', '91e56daf-04ef-4bbc-abe7-5d3a8ee41541'],
  })
  categories: Array<string>;
}
