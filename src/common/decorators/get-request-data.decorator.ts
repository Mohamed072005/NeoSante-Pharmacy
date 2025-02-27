import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetRequestData = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.data;
  },
);
