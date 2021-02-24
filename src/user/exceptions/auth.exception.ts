import { BadRequestException, UnauthorizedException } from '@nestjs/common';

export class AuthException {
  public static incorrectAuthorizationToken(): UnauthorizedException {
    return new UnauthorizedException('Authorization token is incorrect!');
  }

  public static incorrectRefreshToken(): BadRequestException {
    return new BadRequestException('Refresh token is incorrect!');
  }
}
