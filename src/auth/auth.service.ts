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
import { LoginDto } from './dto/dto/login.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    if (this.usersService.findbyEmail(dto.email)) {
      throw new ConflictException('Email already exists');
    }
    const user = await this.usersService.create({
      name: dto.name,
      email: dto.email,
      passwordHash: await bcrypt.hash(dto.password, 10),
      role: Role.ADMIN,
    });
  }
  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    const valid =
      user && (await bcrypt.compare(dto.password, user.passwordHash));
    if (!user || !valid) {
       throw new UnauthorizedException('Invalid email or password');
    }
    return this.buildAuthResponse(user);
  }
  private buildAuthResponse(user: User) {
    const payload = { sub: user.id, role: user.role };
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
