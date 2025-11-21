import { Controller, Get } from '@nestjs/common';
import {
  CurrentUser,
  PermissionsRequired,
  RolesAllowed,
} from '@secure-task-mgmt/auth';
import { AuditAction, PermissionName, RequestUser, RoleName } from '@secure-task-mgmt/data';
import { AuditService } from './audit.service';

@Controller('audit-log')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @RolesAllowed(RoleName.OWNER, RoleName.ADMIN)
  @PermissionsRequired(PermissionName.VIEW_AUDIT_LOG)
  async getAuditLog(@CurrentUser() user: RequestUser) {
    const entries = await this.auditService.findRecent();
    await this.auditService.record(AuditAction.AUDIT_LOG_VIEWED, { user });
    return entries;
  }
}
