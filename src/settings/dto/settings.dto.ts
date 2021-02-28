import { IsOptional, MaxLength, IsEnum, IsUrl, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { LanguageEnum } from '../enum/language.enum';

export class SettingsDTO {
  @IsOptional()
  @IsUrl()
  @MaxLength(parseInt(process.env.MAX_DB_URL_LENGTH))
  @ApiProperty({ example: 'https://photo.com/photo/photo.jpg' })
  logo: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(parseInt(process.env.MAX_DB_URL_LENGTH))
  @ApiProperty({ example: 'https://photo.com/photo/photo.jpg' })
  favicon: string;

  @IsOptional()
  @MinLength(3)
  @MaxLength(255)
  @ApiProperty({ example: 'cms' })
  name: string;

  @IsOptional()
  @IsEnum(LanguageEnum)
  @ApiProperty({ example: LanguageEnum.en })
  language: LanguageEnum;

  @IsOptional()
  @MinLength(3)
  @MaxLength(255)
  @ApiProperty({ example: 'application description' })
  description: string;

  @IsOptional()
  @MinLength(3)
  @MaxLength(255)
  @ApiProperty({ example: 'application nest' })
  keyWords: string;

  @IsOptional()
  @MaxLength(255)
  @ApiProperty({ example: 'Meta title' })
  metaTitle: string;

  @IsOptional()
  @MaxLength(255)
  @ApiProperty({ example: 'Meta description' })
  metaDescription: string;
}
