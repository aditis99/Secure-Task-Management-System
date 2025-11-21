import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from '../entities/permission.entity';
import { Role } from '../entities/role.entity';
import { RbacService } from './rbac.service';
import { RbacSeedService } from './rbac.seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([Permission, Role])],
  providers: [RbacService, RbacSeedService],
  exports: [RbacService],
})
export class RbacModule {}
