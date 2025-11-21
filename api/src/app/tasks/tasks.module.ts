import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditModule } from '../audit/audit.module';
import { Organization } from '../entities/organization.entity';
import { Task } from '../entities/task.entity';
import { OrganizationsModule } from '../organizations/organizations.module';
import { UsersModule } from '../users/users.module';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, Organization]),
    UsersModule,
    OrganizationsModule,
    AuditModule,
  ],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
