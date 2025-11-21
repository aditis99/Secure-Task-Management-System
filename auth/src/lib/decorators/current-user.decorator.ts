import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestUser } from '@secure-task-mgmt/data';

export const CurrentUser = createParamDecorator((_: unknown, ctx: ExecutionContext): RequestUser | null => {
  const request = ctx.switchToHttp().getRequest();
  return request?.user ?? null;
});
