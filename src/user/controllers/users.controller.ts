import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UsersService } from '../providers/services/users.service';
import { AuthGuard } from '../providers/auth.guard';
import { UserInterface } from '../database/models/user.interface';
import { User } from '../database/models/user.model';
import { Roles } from '../decorators/roles.decorator';
import { RoleEnum } from '../enum/role.enum';
import { UserException } from '../exceptions/user.exception';
import { UpdateUserDTO } from '../dto/update-user.dto';
import { CreateUserDTO } from '../dto/create-user.dto';
import { PasswordsService } from '../providers/services/passwords.service';
import * as crypto from 'crypto';

@ApiTags('User')
@Controller('users')
@UseGuards(AuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly passwordService: PasswordsService,
  ) {}

  @Get()
  @Roles(RoleEnum.administrator)
  @ApiBearerAuth()
  @ApiOkResponse({ type: [User] })
  @ApiBadRequestResponse()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  public async getAll(): Promise<Array<UserInterface>> {
    return await this.usersService.getAll(true);
  }

  @Get(':id')
  @Roles(RoleEnum.administrator)
  @ApiBearerAuth()
  @UsePipes(ValidationPipe)
  @ApiOkResponse({ type: User })
  @ApiBadRequestResponse()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  public async get(@Param('id', new ParseUUIDPipe()) id: string): Promise<UserInterface> {
    const user = await this.usersService.getOne({ id }, true);

    if (!user) {
      throw UserException.userNotExist();
    }

    return user;
  }

  @Delete(':id')
  @Roles(RoleEnum.administrator)
  @UsePipes(ValidationPipe)
  @ApiBearerAuth()
  @ApiOkResponse({ type: User })
  @ApiBadRequestResponse()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  public async delete(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    const user = await this.usersService.getOne({ id });

    if (!user) {
      throw UserException.userNotExist();
    }

    await this.usersService.destroy(user);
  }

  @Put(':id')
  @UsePipes(ValidationPipe)
  @Roles(RoleEnum.administrator)
  @ApiBearerAuth()
  @ApiOkResponse({ type: User })
  @ApiBadRequestResponse()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  public async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateUserDTO,
  ): Promise<UserInterface> {
    const user = await this.usersService.getOne({ id });

    if (!user) {
      throw UserException.userNotExist();
    }

    await this.usersService.update(user, dto);

    return await this.usersService.getOne({ id }, true);
  }

  @Post()
  @ApiBearerAuth()
  @UsePipes(ValidationPipe)
  @Roles(RoleEnum.administrator)
  @ApiCreatedResponse({ type: User })
  @ApiBadRequestResponse()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  public async create(@Body() dto: CreateUserDTO): Promise<UserInterface> {
    const password = await this.passwordService.hash(dto.password);

    await this.usersService.create({ ...dto, password });

    return await this.usersService.getOne({ email: dto.email }, true);
  }

  @Put('password/reset/:id')
  @ApiBearerAuth()
  @UsePipes(ValidationPipe)
  @Roles(RoleEnum.administrator)
  @ApiBadRequestResponse()
  @ApiNotFoundResponse()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  public async resetPassword(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    const user = await this.usersService.getOne({ id });

    if (!user) {
      throw UserException.userNotExist();
    }

    const password = crypto.randomBytes(8).toString('base64');

    const hashedPassword = await this.passwordService.hash(password);

    await this.usersService.resetPassword(user, password, hashedPassword);
  }
}
