import { SetMetadata } from '@nestjs/common';
import { PermissionName } from '@secure-task-mgmt/data';
import { PERMISSIONS_KEY } from '../constants';

export const PermissionsRequired = (...permissions: PermissionName[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
