import { services } from './services';
import { AuthGuard } from './auth.guard';

export const providers = [...services, AuthGuard];
