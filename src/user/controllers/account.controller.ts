import {
  ApiBadRequestResponse,
  ApiBearerAuth,
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

@ApiTags('Account')
@UseGuards(AuthGuard)
@Controller('account')
@UseInterceptors(ClassSerializerInterceptor)
export class AccountController {
  constructor(
    private readonly usersService: UsersService,
    private readonly passwordService: PasswordsService,
  ) {}

  @Get()
  @ApiBearerAuth()
  @ApiOkResponse({ type: User })
  @ApiBadRequestResponse()
  @ApiUnauthorizedResponse()
  public async get(@LoggedUser() user: UserInterface): Promise<UserInterface> {
    return await this.usersService.getOne({ id: user.id }, true);
  }

  @Put()
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
}
