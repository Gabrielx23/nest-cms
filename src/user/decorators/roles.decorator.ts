import { SetMetadata } from '@nestjs/common';

export const metaDataKey = 'roles';

export const Roles = (...roles: string[]): any => SetMetadata(metaDataKey, roles);
