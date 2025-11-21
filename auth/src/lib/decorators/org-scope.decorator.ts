import { SetMetadata } from '@nestjs/common';
import { ORG_SCOPE_KEY } from '../constants';
import { OrgScope } from '../types/org-scope.type';

export const OrgScopeGuarded = (scope: OrgScope) => SetMetadata(ORG_SCOPE_KEY, scope);
