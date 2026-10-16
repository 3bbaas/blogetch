import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import { PrismaService } from '../prisma/prisma.service';

function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

export interface CreateUserData {
  name: string;
  email: string;
  passwordHash: string;
  role: User['role'];
}

const fullUserSelect = {
  id: true,
  name: true,
  email: true,
  passwordHash: true,
  role: true,
  createdAt: true,
} as const;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateUserData): Promise<User> {
    return this.prisma.user.create({
      data: {
        name: data.name,
        email: normalizeEmail(data.email),
        passwordHash: data.passwordHash,
        role: data.role,
      },
      select: fullUserSelect,
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email: normalizeEmail(email) },
      select: fullUserSelect,
    });
  }

  async findById(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
      select: fullUserSelect,
    });
  }

  async findByIds(ids: number[]): Promise<User[]> {
    return this.prisma.user.findMany({
      where: { id: { in: ids } },
      select: fullUserSelect,
    });
  }
}
