import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserDAO } from '../../database/dao/user.dao';
import { User } from '../../database/models/user.model';
import { AuthTokenPayloadDTO } from '../../dto/auth-token-payload.dto';
import { JwtTokenTypeEnum } from '../../enum/jwt-token-type.enum';
import { EnvKeyEnum } from '../../../app/enum/env-key.enum';
import * as jwt from 'jsonwebtoken';
import { AuthException } from '../../exceptions/auth.exception';
import { AuthDTO } from '../../dto/auth.dto';
import { UserInterface } from '../../database/models/user.interface';

@Injectable()
export class AuthService {
  constructor(private readonly userDAO: UserDAO, private readonly configService: ConfigService) {}

  public async getUserFromTokenPayload(payload: AuthTokenPayloadDTO): Promise<UserInterface> {
    return await this.userDAO.findOne({ email: payload.email });
  }

  public async decodeToken(
    token: string,
    tokenType: JwtTokenTypeEnum,
  ): Promise<AuthTokenPayloadDTO | any> {
    let secret = this.configService.get(EnvKeyEnum.JWTSecretKey);

    if (tokenType === JwtTokenTypeEnum.refreshToken) {
      secret = this.configService.get(EnvKeyEnum.JWTRefreshSecretKey);
    }

    token = token.replace('Bearer ', '');

    try {
      return jwt.verify(token, secret);
    } catch (err) {
      throw AuthException.incorrectAuthorizationToken();
    }
  }

  public async logout(user: UserInterface): Promise<void> {
    await this.userDAO.update(user as User, { token: null });
  }

  public async login(user: UserInterface): Promise<AuthDTO> {
    const secret = this.configService.get(EnvKeyEnum.JWTSecretKey);
    const refreshSecret = this.configService.get(EnvKeyEnum.JWTRefreshSecretKey);
    const expiresIn = this.configService.get(EnvKeyEnum.JWTExpiresIn);
    const expiresInUnit = this.configService.get(EnvKeyEnum.JWTExpiresInUnit);
    const refreshTokenExpiresIn = expiresIn * 2;

    const authDTO = new AuthDTO();

    authDTO.token = jwt.sign({ email: user.email }, secret, {
      expiresIn: expiresIn + expiresInUnit,
    });

    authDTO.refreshToken = jwt.sign({ email: user.email }, refreshSecret, {
      expiresIn: refreshTokenExpiresIn + expiresInUnit,
    });

    await this.userDAO.update(user as User, { token: authDTO.token });

    return authDTO;
  }
}
