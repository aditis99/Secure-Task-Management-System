import { SetMetadata } from '@nestjs/common';
import { RoleName } from '@secure-task-mgmt/data';
import { ROLES_KEY } from '../constants';

export const RolesAllowed = (...roles: RoleName[]) => SetMetadata(ROLES_KEY, roles);
