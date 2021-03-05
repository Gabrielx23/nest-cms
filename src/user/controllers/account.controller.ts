import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Patch,
  Put,
  Post,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { LoggedUser } from '../decorators/logged-user.decorator';
import { UsersService } from '../providers/services/users.service';
import { PasswordsService } from '../providers/services/passwords.service';
import { AuthGuard } from '../providers/auth.guard';
import { UserInterface } from '../database/models/user.interface';
import { User } from '../database/models/user.model';
import { UpdateAccountDTO } from '../dto/update-account.dto';
import { ChangePasswordDTO } from '../dto/change-password.dto';
import { UserException } from '../exceptions/user.exception';
import { PasswordResetRequestDTO } from '../dto/password-reset-request.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { PasswordResetDTO } from '../dto/password-reset.dto';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { EnvKeyEnum } from '../../app/enum/env-key.enum';
import { Crypter } from '../../app/utils/crypter';

@ApiTags('Account')
@Controller('account')
@UseInterceptors(ClassSerializerInterceptor)
export class AccountController {
  constructor(
    private readonly usersService: UsersService,
    private readonly passwordService: PasswordsService,
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: User })
  @ApiBadRequestResponse()
  @ApiUnauthorizedResponse()
  public async get(@LoggedUser() user: UserInterface): Promise<UserInterface> {
    return await this.usersService.getOne({ id: user.id }, true);
  }

  @Put()
  @UseGuards(AuthGuard)
  @UsePipes(ValidationPipe)
  @ApiBearerAuth()
  @ApiOkResponse({ type: User })
  @ApiBadRequestResponse()
  @ApiUnauthorizedResponse()
  public async update(
    @LoggedUser() user: UserInterface,
    @Body() dto: UpdateAccountDTO,
  ): Promise<UserInterface> {
    await this.usersService.update(user, dto);

    return await this.usersService.getOne({ id: user.id }, true);
  }

  @Patch('password')
  @UseGuards(AuthGuard)
  @UsePipes(ValidationPipe)
  @ApiBearerAuth()
  @ApiOkResponse({ type: User })
  @ApiBadRequestResponse()
  @ApiUnauthorizedResponse()
  public async changePassword(
    @LoggedUser() user: UserInterface,
    @Body() dto: ChangePasswordDTO,
  ): Promise<UserInterface> {
    if (!(await this.passwordService.verify(dto.oldPassword, user.password))) {
      throw UserException.wrongCredentials();
    }

    const password = await this.passwordService.hash(dto.password);

    await this.usersService.update(user, { password });

    return await this.usersService.getOne({ id: user.id }, true);
  }

  @Post('password/reset/request')
  @UsePipes(ValidationPipe)
  @ApiOkResponse()
  @ApiNotFoundResponse()
  public async resetPasswordRequest(@Body() dto: PasswordResetRequestDTO): Promise<void> {
    const user = await this.usersService.getOne({ email: dto.email });

    if (!user) {
      throw UserException.userNotExist();
    }

    const frontURL = this.configService.get(EnvKeyEnum.FrontURLResetPassword);

    const secret = await this.configService.get(EnvKeyEnum.CryptSecret);

    const encrypted = Crypter.encrypt(`${user.email}"${new Date()}`, secret);

    const url = `${frontURL}?${encrypted};`;

    await this.usersService.resetPasswordRequest(user, url);
  }

  @Post('password/reset')
  @UsePipes(ValidationPipe)
  @ApiOkResponse()
  @ApiNotFoundResponse()
  public async resetPassword(@Body() dto: PasswordResetDTO): Promise<void> {
    const password = crypto.randomBytes(8).toString('base64');

    const hashedPassword = await this.passwordService.hash(password);

    const secret = await this.configService.get(EnvKeyEnum.CryptSecret);

    const decrypted = Crypter.decrypt(dto.token, secret);

    const tokenData = decrypted.split('"');

    const user = await this.usersService.getOne({ email: tokenData[0] });

    if (!user) {
      throw UserException.userNotExist();
    }

    await this.usersService.resetPassword(user, password, hashedPassword);
  }
}
