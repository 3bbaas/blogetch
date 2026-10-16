import type { Request } from 'express';
import { Role } from '../enums/role.enum';

export interface AuthenticatedUser {
  id: number;
  email: string;
  name: string;
  role: Role;
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}
