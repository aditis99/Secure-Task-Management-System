import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { UsersService } from './users/users.service';
import { RbacService } from './rbac/rbac.service';

@Injectable()
export class AppInitializer implements OnApplicationBootstrap {
  private readonly logger = new Logger(AppInitializer.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly rbacService: RbacService
  ) {}

  async onApplicationBootstrap() {
    try {
      // Ensure RBAC is seeded first (permissions and roles)
      await this.rbacService.ensureRoles();
      this.logger.log('RBAC roles and permissions verified');

      // Then ensure the default admin user exists
      await this.usersService.ensureAdminExists();
      this.logger.log('Default admin user verification completed');
    } catch (error) {
      this.logger.error('Failed to initialize application data', error);
      throw error;
    }
  }
}
