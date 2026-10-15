import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { Role } from '../common/enums/role.enum';
import { LoginDto } from './dto/login.dto';
import { User } from '../users/entities/user.entity';
import { JwtPayload } from './strategies/jwt.strategy';

export interface AuthUserResponse {
  id: number;
  name: string;
  email: string;
  role: Role;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUserResponse;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<void> {
    if (await this.usersService.findByEmail(dto.email)) {
      throw new ConflictException('Email already exists');
    }
    const passwordHash = await bcrypt.hash(dto.password, 10);
    await this.usersService.create({
      name: dto.name,
      email: dto.email,
      passwordHash,
      role: Role.AUTHOR,
    });
  }

  async login(dto: LoginDto): Promise<LoginResponse> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return this.buildAuthResponse(user);
  }

  private buildAuthResponse(user: User): LoginResponse {
    const payload: JwtPayload = { sub: user.id, role: user.role };
    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}
