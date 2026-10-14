import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { Role } from '../common/enums/role.enum';
import { User } from './entities/user.entity';

function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

@Injectable()
export class UsersService implements OnModuleInit {
  private users: User[] = [];
  private nextId = 1;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit(): void {
    const email = this.configService.get<string>('ADMIN_EMAIL');
    const password = this.configService.get<string>('ADMIN_PASSWORD');
    if (email === undefined || password === undefined) {
      return;
    }
    const normalized = normalizeEmail(email);
    if (this.findByEmail(normalized) !== undefined) {
      return;
    }
    const passwordHash = bcrypt.hashSync(password, 10);
    this.create({
      name: 'Admin',
      email: normalized,
      passwordHash,
      role: Role.ADMIN,
    });
  }

  create(data: Omit<User, 'createdAt' | 'id'>): User {
    const user: User = {
      id: this.nextId++,
      createdAt: new Date(),
      ...data,
      email: normalizeEmail(data.email),
    };
    this.users.push(user);
    return user;
  }

  findByEmail(email: string): User | undefined {
    const normalized = normalizeEmail(email);
    return this.users.find((user) => user.email === normalized);
  }

  findById(id: number): User | undefined {
    return this.users.find((u) => u.id === id);
  }
  findByIds(ids: number[]): User[] {
    return this.users.filter((u) => ids.includes(u.id));
  }
}
