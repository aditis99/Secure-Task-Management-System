import { RoleName } from '../enums/role.enum';
import { PermissionName } from '../enums/permission.enum';

export interface RequestUser {
  id: string;
  email: string;
  role: RoleName;
  organizationId?: string;
  permissions: PermissionName[];
}
