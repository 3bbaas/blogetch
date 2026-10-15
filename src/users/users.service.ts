import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { Role } from '../common/enums/role.enum';
import { User } from './entities/user.entity';
import { PrismaService } from '../prisma/prisma.service';

function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

function parseRole(value: string): Role {
  if ((Object.values(Role) as string[]).includes(value)) {
    return value as Role;
  }
  throw new Error(`Unknown role in database: ${value}`);
}

export interface CreateUserData {
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
}

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit(): Promise<void> {
    const email = this.configService.get<string>('ADMIN_EMAIL');
    const password = this.configService.get<string>('ADMIN_PASSWORD');
    if (email === undefined || password === undefined) {
      return;
    }
    const normalized = normalizeEmail(email);
    const passwordHash = await bcrypt.hash(password, 10);
    await this.prisma.user.upsert({
      where: { email: normalized },
      update: {},
      create: {
        name: 'Admin',
        email: normalized,
        passwordHash,
        role: Role.ADMIN,
      },
    });
  }

  async create(data: CreateUserData): Promise<User> {
    const row = await this.prisma.user.create({
      data: {
        name: data.name,
        email: normalizeEmail(data.email),
        passwordHash: data.passwordHash,
        role: data.role,
      },
    });
    return { ...row, role: parseRole(row.role) };
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({
      where: { email: normalizeEmail(email) },
    });
    return row === null ? null : { ...row, role: parseRole(row.role) };
  }

  async findById(id: number): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { id } });
    return row === null ? null : { ...row, role: parseRole(row.role) };
  }

  async findByIds(ids: number[]): Promise<User[]> {
    const rows = await this.prisma.user.findMany({
      where: { id: { in: ids } },
    });
    return rows.map((row) => ({ ...row, role: parseRole(row.role) }));
  }
}
