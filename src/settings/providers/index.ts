import { services } from './services';
import { gateways } from './gateways';

export const providers = [...services, ...gateways];
