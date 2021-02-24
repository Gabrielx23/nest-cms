import { CanActivate, ExecutionContext, Injectable, Scope } from '@nestjs/common';
import { AuthException } from '../exceptions/auth.exception';
import { JwtTokenTypeEnum } from '../enum/jwt-token-type.enum';
import { AuthService } from './services/auth.service';

@Injectable({ scope: Scope.REQUEST })
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

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

    request.user = user;

    return true;
  }
}
