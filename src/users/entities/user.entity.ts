import { Role } from '../../common/enums/role.enum';

export class User {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  createdAt: Date;
}
