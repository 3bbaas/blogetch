import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  private users: User[] = [];
  private nextId = 1;
  create(data: Omit<User, 'createdAt' | 'id'>): User {
    const user: User = { id: this.nextId++, createdAt: new Date(), ...data };
    this.users.push(user);
    return user;
  }

  findbyEmail(email: string): User | undefined {
    return this.users.find((user) => user.email === email.toLowerCase());
  }

  findById(id: number): User | undefined {
    return this.users.find((u) => u.id === id);
  }
}
