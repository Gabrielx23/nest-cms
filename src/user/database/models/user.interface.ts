import { RoleEnum } from '../../enum/role.enum';

export interface UserInterface {
  id?: string;
  name: string;
  email: string;
  role: RoleEnum;
  password?: string;
  token?: string;
}
