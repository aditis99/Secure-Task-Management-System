import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
  AuditAction,
  JwtPayload,
  RequestUser,
} from '@secure-task-mgmt/data';
import { LoginDto, RegisterUserDto } from '@secure-task-mgmt/data/backend';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly auditService: AuditService
  ) {}

  async register(dto: RegisterUserDto) {
    const user = await this.usersService.createUser(dto);
    await this.auditService.record(AuditAction.USER_REGISTERED, {
      user: {
        id: user.id,
        email: user.email,
        role: user.roleName,
        organizationId: user.organization?.id,
        permissions: this.usersService.mapPermissions(user),
      },
      context: { event: 'register' },
    });
    return user;
  }

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user || !user.isActive) {
      return null;
    }
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return null;
    }
    return user;
  }

  async login(dto: LoginDto) {
    const user = await this.validateUser(dto.email, dto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const permissions = this.usersService.mapPermissions(user);

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.roleName,
      organizationId: user.organization?.id,
      permissions,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    await this.auditService.record(AuditAction.LOGIN, {
      user: {
        id: user.id,
        email: user.email,
        role: user.roleName,
        organizationId: user.organization?.id,
        permissions,
      },
    });

    return {
      accessToken,
      user: payload,
    };
  }

  buildRequestUser(payload: JwtPayload): RequestUser {
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      organizationId: payload.organizationId,
      permissions: payload.permissions,
    };
  }
}
