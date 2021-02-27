import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiTags,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  Body,
  Controller,
  Get,
  UsePipes,
  ValidationPipe,
  UseGuards,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { AuthGuard } from '../../user/providers/auth.guard';
import { SettingsService } from '../providers/services/settings.service';
import { Setting } from '../database/models/setting.model';
import { SettingDTO } from '../dto/setting.dto';
import { SettingInterface } from '../database/models/setting.interface';
import { SettingException } from '../exceptions/setting.exception';

@ApiTags('Setting')
@Controller('settings')
@UseGuards(AuthGuard)
@ApiBearerAuth()
@ApiBadRequestResponse()
@ApiForbiddenResponse()
@ApiUnauthorizedResponse()
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Post('/')
  @UsePipes(ValidationPipe)
  @ApiOkResponse({ type: [Setting] })
  public async update(@Body() settingDTO: SettingDTO): Promise<Array<SettingInterface>> {
    for (const toUpdate of Object.keys(settingDTO)) {
      const setting = await this.settingsService.getOne({ name: toUpdate });

      if (!setting) {
        continue;
      }

      await this.settingsService.update(setting, { name: toUpdate, value: settingDTO[toUpdate] });
    }

    return await this.settingsService.getAll();
  }

  @Get('/')
  @ApiOkResponse({ type: [Setting] })
  public async getAll(): Promise<Array<SettingInterface>> {
    return await this.settingsService.getAll();
  }

  @Get('/name/:name')
  @ApiOkResponse({ type: Setting })
  public async getOneByName(@Param('name') name: string): Promise<SettingInterface> {
    const setting = await this.settingsService.getOne({ name });

    if (!setting) {
      throw SettingException.settingNotExist();
    }

    return setting;
  }

  @Get('/:id')
  @ApiOkResponse({ type: Setting })
  public async getOne(@Param('id', new ParseUUIDPipe()) id: string): Promise<SettingInterface> {
    const setting = await this.settingsService.getOne({ id });

    if (!setting) {
      throw SettingException.settingNotExist();
    }

    return setting;
  }
}
