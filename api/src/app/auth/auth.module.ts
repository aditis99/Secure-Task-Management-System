import { Module } from '@nestjs/common';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { UsersModule } from '../users/users.module';
import { User } from '../entities/user.entity';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    ConfigModule,
    UsersModule,
    AuditModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): JwtModuleOptions => {
        const expiresValue = config.get<string>('JWT_EXPIRES_IN', '3600');
        const parsedExpires = Number(expiresValue);
        const expiresIn = Number.isNaN(parsedExpires) ? 3600 : parsedExpires;
        return {
          secret: config.get<string>('JWT_SECRET', 'dev-secret'),
          signOptions: { expiresIn },
        };
      },
    }),
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
