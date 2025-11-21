import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { RbacService } from './rbac.service';

@Injectable()
export class RbacSeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(RbacSeedService.name);

  constructor(private readonly rbacService: RbacService) {}

  async onApplicationBootstrap() {
    await this.rbacService.ensureRoles();
    this.logger.log('RBAC roles and permissions verified');
  }
}
