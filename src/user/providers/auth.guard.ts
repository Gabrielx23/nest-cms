import { CanActivate, ExecutionContext, Injectable, Scope } from '@nestjs/common';
import { AuthException } from '../exceptions/auth.exception';
import { JwtTokenTypeEnum } from '../enum/jwt-token-type.enum';
import { AuthService } from './services/auth.service';
import { Reflector } from '@nestjs/core';
import { metaDataKey } from '../decorators/roles.decorator';

@Injectable({ scope: Scope.REQUEST })
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService, private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization;

    if (!token) {
      throw AuthException.incorrectAuthorizationToken();
    }

    const payload = await this.authService.decodeToken(token, JwtTokenTypeEnum.token);
    const user = await this.authService.getUserFromTokenPayload(payload);

    if (!user || user.token !== token.replace('Bearer ', '')) {
      throw AuthException.incorrectAuthorizationToken();
    }

    const roles = this.reflector.get<string[]>(metaDataKey, context.getHandler());
    const hasPrivileges = roles ? roles.includes(user.role) : true;

    console.log(roles);
    console.log(user.role);

    if (!hasPrivileges) {
      throw AuthException.insufficientPrivileges();
    }

    request.user = user;

    return true;
  }
}
