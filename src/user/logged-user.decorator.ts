import { createParamDecorator } from '@nestjs/common';
import { User } from './database/models/user.model';

export const LoggedUser = createParamDecorator(
  (data, req): User => {
    const request = req.switchToHttp().getRequest();

    return request.user;
  },
);
