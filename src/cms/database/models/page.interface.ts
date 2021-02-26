import { PageTemplateTypeEnum } from '../../enum/page-template-type.enum';

export interface PageInterface {
  id?: string;
  name: string;
  content: string;
  isPage?: boolean;
  publishedAt?: Date;
  template?: PageTemplateTypeEnum;
  slug?: string;
  authorId?: string;
  thumbnail?: string;
  metaTitle?: string;
  metaDescription?: string;
}
