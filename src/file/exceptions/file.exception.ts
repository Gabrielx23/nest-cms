import { BadRequestException, NotFoundException } from '@nestjs/common';

export class FileException {
  public static fileNotExist(): NotFoundException {
    return new NotFoundException('File not exist!');
  }

  public static fileNotSent(): BadRequestException {
    return new BadRequestException('File not sent!');
  }
}
