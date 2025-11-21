import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization } from '../entities/organization.entity';
import { Role } from '../entities/role.entity';
import { User } from '../entities/user.entity';
import { RbacModule } from '../rbac/rbac.module';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Organization, Role]), RbacModule],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
