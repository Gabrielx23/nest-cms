import { BadRequestException, NotFoundException } from '@nestjs/common';

export class CategoryException {
  public static categoryNotExist(): NotFoundException {
    return new NotFoundException('Category not exist!');
  }

  public static slugAlreadyExist(): BadRequestException {
    return new BadRequestException('Slug already exist!');
  }

  public static tooManyGenerateSlugAttempts(): BadRequestException {
    return new BadRequestException('Too many generate slug attempts!');
  }

  public static parentCategoryNotExist(): NotFoundException {
    return new NotFoundException('Parent category not exist!');
  }

  public static categoryCannotHaveParentWithSameId(): BadRequestException {
    return new BadRequestException('Category cannot have parent with the same id!');
  }
}
