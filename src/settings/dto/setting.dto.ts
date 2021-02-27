import { IsOptional, MaxLength, IsEnum, IsUrl, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { LanguageEnum } from '../enum/language.enum';

export class SettingDTO {
  @IsOptional()
  @IsUrl()
  @MaxLength(65535)
  @ApiProperty({ example: 'https://photo.com/photo/photo.jpg' })
  logo: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(65535)
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
}
