import { BadRequestException, NotFoundException } from '@nestjs/common';

export class UserException {
  public static userNotExist(): NotFoundException {
    return new NotFoundException('User not exist!');
  }

  public static credentialsAlreadyInUse(): BadRequestException {
    return new BadRequestException('Selected credentials are already in use!');
  }

  public static wrongCredentials(): BadRequestException {
    return new BadRequestException('Wrong credentials provided!');
  }
}
