import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  PermissionName,
  RoleName,
} from '@secure-task-mgmt/data';
import { RegisterUserDto } from '@secure-task-mgmt/data/backend';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { Organization } from '../entities/organization.entity';
import { User } from '../entities/user.entity';
import { RbacService } from '../rbac/rbac.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
    private readonly rbacService: RbacService
  ) {}

  async createUser(dto: RegisterUserDto): Promise<User> {
    const existing = await this.userRepository.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('User already exists');
    }

    let organization: Organization | null = null;
    if (dto.organizationId) {
      organization = await this.organizationRepository.findOne({
        where: { id: dto.organizationId },
        relations: ['parent'],
      });
      if (!organization) {
        throw new NotFoundException('Organization not found');
      }
    } else if (dto.role !== RoleName.OWNER) {
      throw new BadRequestException('Non-owner accounts must belong to an organization');
    } else {
      organization = await this.ensureRootOrganization();
    }

    const role = await this.rbacService.getRole(dto.role);
    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = this.userRepository.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email.toLowerCase(),
      passwordHash,
      organization,
      role,
      roleName: dto.role,
    });

    const saved = await this.userRepository.save(user);
    return this.sanitizeUser(saved);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email: email.toLowerCase() },
      relations: ['organization', 'role', 'role.permissions'],
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
      relations: ['organization', 'role', 'role.permissions'],
    });
  }

  async ensureAdminExists(): Promise<void> {
    const count = await this.userRepository.count();
    if (count === 0) {
      const fallbackOrg = await this.ensureRootOrganization();
      const defaultPassword = await bcrypt.hash('ChangeMe123!', 10);
      const ownerRole = await this.rbacService.getRole(RoleName.OWNER);
      await this.userRepository.save(
        this.userRepository.create({
          firstName: 'System',
          lastName: 'Owner',
          email: 'owner@secure-task.dev',
          passwordHash: defaultPassword,
          organization: fallbackOrg,
          role: ownerRole,
          roleName: RoleName.OWNER,
        })
      );
    }
  }

  async listUsersForOrganization(orgId: string): Promise<User[]> {
    return this.userRepository.find({
      where: { organization: { id: orgId } },
      relations: ['role'],
    });
  }

  mapPermissions(user: User): PermissionName[] {
    const permissions = user.role?.permissions?.map((perm) => perm.name) ?? [];
    return Array.from(new Set(permissions));
  }

  private sanitizeUser(user: User): User {
    const clone = { ...user };
    delete (clone as Partial<User>).passwordHash;
    return clone as User;
  }

  private async ensureRootOrganization(): Promise<Organization> {
    const existing = await this.organizationRepository.find({
      order: { createdAt: 'ASC' },
      take: 1,
    });
    if (existing.length) {
      return existing[0];
    }
    return this.organizationRepository.save(
      this.organizationRepository.create({ name: 'Root Org', level: 1 })
    );
  }
}
