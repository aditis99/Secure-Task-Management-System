import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  RequestUser,
  RoleName,
  AuditAction,
} from '@secure-task-mgmt/data';
import { CreateTaskDto, TaskFiltersDto, UpdateTaskDto } from '@secure-task-mgmt/data/backend';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../entities/task.entity';
import { Organization } from '../entities/organization.entity';
import { UsersService } from '../users/users.service';
import { OrganizationsService } from '../organizations/organizations.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
    private readonly usersService: UsersService,
    private readonly organizationsService: OrganizationsService,
    private readonly auditService: AuditService
  ) {}

  async createTask(user: RequestUser, dto: CreateTaskDto) {
    const organization = await this.resolveOrganizationForAction(user, dto.organizationId);
    const creator = await this.usersService.findById(user.id);
    if (!creator) {
      throw new NotFoundException('Creator not found');
    }
    const task = this.taskRepository.create({
      title: dto.title,
      description: dto.description,
      status: dto.status,
      category: dto.category,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      organization,
      createdBy: creator,
    });
    const saved = await this.taskRepository.save(task);
    await this.auditService.record(AuditAction.TASK_CREATED, {
      user,
      context: { taskId: saved.id },
    });
    return saved;
  }

  async getTasks(user: RequestUser, filters: TaskFiltersDto) {
    const qb = this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.organization', 'organization')
      .leftJoinAndSelect('task.createdBy', 'createdBy')
      .orderBy('task.createdAt', 'DESC');

    const orgScope = await this.getOrganizationScopeIds(user);
    if (!orgScope.length) {
      return [];
    }
    qb.where('organization.id IN (:...orgIds)', { orgIds: orgScope });

    if (filters.status) {
      qb.andWhere('task.status = :status', { status: filters.status });
    }
    if (filters.category) {
      qb.andWhere('task.category = :category', { category: filters.category });
    }
    if (filters.search) {
      qb.andWhere('(LOWER(task.title) LIKE :search OR LOWER(task.description) LIKE :search)', {
        search: `%${filters.search.toLowerCase()}%`,
      });
    }

    const tasks = await qb.getMany();
    await this.auditService.record(AuditAction.TASK_VIEWED, { user });
    return tasks;
  }

  async getTask(taskId: string, user: RequestUser) {
    const task = await this.taskRepository.findOne({
      where: { id: taskId },
      relations: ['organization', 'createdBy'],
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    await this.ensureTaskAccess(user, task.organization.id);
    await this.auditService.record(AuditAction.TASK_VIEWED, {
      user,
      context: { taskId },
    });
    return task;
  }

  async updateTask(taskId: string, user: RequestUser, dto: UpdateTaskDto) {
    const task = await this.taskRepository.findOne({
      where: { id: taskId },
      relations: ['organization'],
    });
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    await this.ensureTaskAccess(user, task.organization.id);

    if (dto.title !== undefined) task.title = dto.title;
    if (dto.description !== undefined) task.description = dto.description;
    if (dto.status !== undefined) task.status = dto.status;
    if (dto.category !== undefined) task.category = dto.category;
    if (dto.dueDate !== undefined) {
      task.dueDate = dto.dueDate ? new Date(dto.dueDate) : null;
    }
    if (dto.organizationId) {
      task.organization = await this.resolveOrganizationForAction(user, dto.organizationId);
    }

    const saved = await this.taskRepository.save(task);
    await this.auditService.record(AuditAction.TASK_UPDATED, {
      user,
      context: { taskId: saved.id },
    });
    return saved;
  }

  async deleteTask(taskId: string, user: RequestUser) {
    const task = await this.taskRepository.findOne({
      where: { id: taskId },
      relations: ['organization'],
    });
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    await this.ensureTaskAccess(user, task.organization.id);
    await this.taskRepository.remove(task);
    await this.auditService.record(AuditAction.TASK_DELETED, {
      user,
      context: { taskId },
    });
    return { deleted: true };
  }

  private async resolveOrganizationForAction(user: RequestUser, organizationId?: string) {
    const resolvedId = organizationId ?? user.organizationId;
    if (!resolvedId) {
      throw new BadRequestException('Organization context required - user must belong to an organization');
    }

    if (user.role !== RoleName.OWNER && resolvedId !== user.organizationId) {
      throw new BadRequestException('Cannot act on another organization');
    }

    const organization = await this.organizationRepository.findOne({
      where: { id: resolvedId },
      relations: ['parent'],
    });
    if (!organization) {
      throw new NotFoundException(`Organization not found: ${resolvedId}`);
    }
    if (user.role === RoleName.OWNER && user.organizationId) {
      const scope = await this.getOrganizationScopeIds(user);
      if (!scope.includes(organization.id)) {
        throw new BadRequestException('Organization outside of owner hierarchy');
      }
    }
    return organization;
  }

  private async getOrganizationScopeIds(user: RequestUser): Promise<string[]> {
    if (user.role === RoleName.OWNER && user.organizationId) {
      return this.organizationsService.getDescendantOrganizationIds(user.organizationId);
    }
    if (user.organizationId) {
      return [user.organizationId];
    }
    return [];
  }

  private async ensureTaskAccess(user: RequestUser, organizationId: string) {
    const scope = await this.getOrganizationScopeIds(user);
    if (!scope.includes(organizationId)) {
      throw new BadRequestException('Task outside of your organization scope');
    }
  }
}
