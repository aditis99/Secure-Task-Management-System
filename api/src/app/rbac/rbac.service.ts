import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PermissionName, RoleName } from '@secure-task-mgmt/data';
import { In, Repository } from 'typeorm';
import { Permission } from '../entities/permission.entity';
import { Role } from '../entities/role.entity';

const ROLE_RANK: Record<RoleName, number> = {
  [RoleName.OWNER]: 100,
  [RoleName.ADMIN]: 50,
  [RoleName.VIEWER]: 10,
};

const DEFAULT_PERMISSION_DESCRIPTIONS: Record<PermissionName, string> = {
  [PermissionName.CREATE_TASK]: 'Create new tasks',
  [PermissionName.READ_TASK]: 'Read tasks within scope',
  [PermissionName.UPDATE_TASK]: 'Update tasks within scope',
  [PermissionName.DELETE_TASK]: 'Delete tasks within scope',
  [PermissionName.VIEW_AUDIT_LOG]: 'View audit log entries',
};

export const ROLE_PERMISSION_MAP: Record<RoleName, PermissionName[]> = {
  [RoleName.OWNER]: [
    PermissionName.CREATE_TASK,
    PermissionName.READ_TASK,
    PermissionName.UPDATE_TASK,
    PermissionName.DELETE_TASK,
    PermissionName.VIEW_AUDIT_LOG,
  ],
  [RoleName.ADMIN]: [
    PermissionName.CREATE_TASK,
    PermissionName.READ_TASK,
    PermissionName.UPDATE_TASK,
    PermissionName.DELETE_TASK,
  ],
  [RoleName.VIEWER]: [PermissionName.READ_TASK],
};

@Injectable()
export class RbacService {
  private readonly logger = new Logger(RbacService.name);

  constructor(
    @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>
  ) {}

  async ensurePermissions(): Promise<Permission[]> {
    const existing = await this.permissionRepository.find();
    if (existing.length === Object.keys(DEFAULT_PERMISSION_DESCRIPTIONS).length) {
      return existing;
    }

    const missing = Object.entries(DEFAULT_PERMISSION_DESCRIPTIONS)
      .filter(([name]) => !existing.find((perm) => perm.name === name))
      .map(([name, description]) =>
        this.permissionRepository.create({
          name: name as PermissionName,
          description,
        })
      );

    if (missing.length) {
      await this.permissionRepository.save(missing);
      this.logger.log(`Seeded ${missing.length} permissions`);
    }

    return this.permissionRepository.find();
  }

  async ensureRoles(): Promise<void> {
    const permissions = await this.ensurePermissions();
    for (const [roleName, permissionNames] of Object.entries(ROLE_PERMISSION_MAP) as [
      RoleName,
      PermissionName[],
    ][]) {
      let role = await this.roleRepository.findOne({
        where: { name: roleName },
        relations: ['permissions'],
      });

      if (!role) {
        role = this.roleRepository.create({
          name: roleName,
          permissions: [],
          rank: ROLE_RANK[roleName],
        });
      }

      const mappedPermissions = permissions.filter((perm) => permissionNames.includes(perm.name));
      role.permissions = mappedPermissions;
      role.rank = ROLE_RANK[roleName];
      await this.roleRepository.save(role);
    }
  }

  async getRole(roleName: RoleName): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { name: roleName },
      relations: ['permissions'],
    });
    if (!role) {
      throw new Error(`Role ${roleName} is not configured`);
    }
    return role;
  }

  async getRolesByNames(roleNames: RoleName[]): Promise<Role[]> {
    return this.roleRepository.find({
      where: { name: In(roleNames) },
      relations: ['permissions'],
    });
  }
}
