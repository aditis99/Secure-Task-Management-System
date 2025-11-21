import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  RequestUser,
  RoleName,
} from '@secure-task-mgmt/data';
import { CreateOrganizationDto } from '@secure-task-mgmt/data/backend';
import { Repository } from 'typeorm';
import { Organization } from '../entities/organization.entity';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>
  ) {}

  async createOrganization(dto: CreateOrganizationDto): Promise<Organization> {
    let level = 1;
    let parent: Organization | null = null;

    if (dto.parentId) {
      parent = await this.organizationRepository.findOne({
        where: { id: dto.parentId },
        relations: ['parent'],
      });
      if (!parent) {
        throw new NotFoundException('Parent organization not found');
      }

      if (parent.level >= 2) {
        throw new BadRequestException('Only two organization levels are supported');
      }

      level = parent.level + 1;
    }

    const organization = this.organizationRepository.create({
      name: dto.name,
      parent: parent ?? null,
      level,
    });

    return this.organizationRepository.save(organization);
  }

  async listOrganizationsForUser(user: RequestUser): Promise<Organization[]> {
    if (user.role === RoleName.OWNER) {
      return this.organizationRepository.find({
        relations: ['parent'],
        order: { name: 'ASC' },
      });
    }

    if (!user.organizationId) {
      return [];
    }

    const org = await this.organizationRepository.find({
      where: [{ id: user.organizationId }],
      relations: ['parent'],
    });

    return org;
  }

  async getOrganizationPath(orgId: string): Promise<Organization[]> {
    const organization = await this.organizationRepository.findOne({
      where: { id: orgId },
      relations: ['parent', 'parent.parent'],
    });
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }
    const result = [organization];
    if (organization.parent) {
      result.push(organization.parent);
    }
    if (organization.parent?.parent) {
      result.push(organization.parent.parent);
    }
    return result;
  }

  async getDescendantOrganizationIds(orgId: string): Promise<string[]> {
    const target = await this.organizationRepository.findOne({ where: { id: orgId } });
    if (!target) {
      throw new NotFoundException('Organization not found');
    }

    const organizations = await this.organizationRepository.find({
      relations: ['parent'],
    });
    const map = new Map<string, string[]>();
    organizations.forEach((org) => {
      if (org.parent?.id) {
        const siblings = map.get(org.parent.id) ?? [];
        siblings.push(org.id);
        map.set(org.parent.id, siblings);
      }
    });

    const stack = [orgId];
    const result = new Set<string>([orgId]);
    while (stack.length) {
      const current = stack.pop()!;
      const children = map.get(current) ?? [];
      for (const child of children) {
        if (!result.has(child)) {
          result.add(child);
          stack.push(child);
        }
      }
    }
    return Array.from(result);
  }
}
