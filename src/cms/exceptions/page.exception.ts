import { BadRequestException, NotFoundException } from '@nestjs/common';

export class PageException {
  public static pageNotExist(): NotFoundException {
    return new NotFoundException('Page not exist!');
  }

  public static slugAlreadyExist(): BadRequestException {
    return new BadRequestException('Slug already exist!');
  }

  public static tooManyGenerateSlugAttempts(): BadRequestException {
    return new BadRequestException('Too many generate slug attempts!');
  }
}
