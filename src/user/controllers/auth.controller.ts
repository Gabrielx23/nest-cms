import { ApiBadRequestResponse, ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Post, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { LoggedUser } from '../decorators/logged-user.decorator';
import { UsersService } from '../providers/services/users.service';
import { AuthService } from '../providers/services/auth.service';
import { PasswordsService } from '../providers/services/passwords.service';
import { AuthGuard } from '../providers/auth.guard';
import { AuthDTO } from '../dto/auth.dto';
import { LoginDTO } from '../dto/login.dto';
import { UserException } from '../exceptions/user.exception';
import { RefreshTokenDTO } from '../dto/refresh-token.dto';
import { JwtTokenTypeEnum } from '../enum/jwt-token-type.enum';
import { AuthException } from '../exceptions/auth.exception';
import { RegisterDTO } from '../dto/register.dto';
import { UserInterface } from '../database/models/user.interface';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
    private readonly passwordService: PasswordsService,
  ) {}

  @Post('logout')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse()
  @ApiBadRequestResponse()
  public async logout(@LoggedUser() user: UserInterface): Promise<void> {
    await this.authService.logout(user);
  }

  @Post('register')
  @UsePipes(ValidationPipe)
  @ApiCreatedResponse()
  @ApiBadRequestResponse()
  public async register(@Body() registerDTO: RegisterDTO): Promise<void> {
    const password = await this.passwordService.hash(registerDTO.password);

    const partial = { ...registerDTO, password };

    await this.usersService.create(partial);
  }

  @Post('login')
  @UsePipes(ValidationPipe)
  @ApiCreatedResponse({ type: AuthDTO })
  @ApiBadRequestResponse()
  public async login(@Body() loginDTO: LoginDTO): Promise<AuthDTO> {
    const user = await this.usersService.getOne({ email: loginDTO.email });

    if (!user || !(await this.passwordService.verify(loginDTO.password, user.password))) {
      throw UserException.wrongCredentials();
    }

    return await this.authService.login(user);
  }

  @Post('refresh')
  @UsePipes(ValidationPipe)
  @ApiCreatedResponse({ type: AuthDTO })
  @ApiBadRequestResponse()
  public async refresh(@Body() refreshTokenDTO: RefreshTokenDTO): Promise<AuthDTO> {
    const decoded = await this.authService.decodeToken(
      refreshTokenDTO.refreshToken,
      JwtTokenTypeEnum.refreshToken,
    );

    const user = await this.usersService.getOne({ email: decoded.email });

    if (!user) {
      throw AuthException.incorrectRefreshToken();
    }

    return await this.authService.login(user);
  }
}
