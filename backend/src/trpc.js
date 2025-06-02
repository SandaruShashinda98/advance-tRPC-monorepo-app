import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import { PermissionService } from './services/permissionService.js';

const t = initTRPC.context().create();

export const router = t.router;
export const publicProcedure = t.procedure;

// Protected procedure that requires authentication
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource'
    });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});

// Permission-based procedure factory
export const createPermissionProcedure = (requiredPermission, options = {}) => {
  return protectedProcedure.use(async ({ ctx, next, input }) => {
    const context = {
      ownerId: options.getOwnerId ? options.getOwnerId(input, ctx) : null,
      userId: ctx.user._id,
      ...options.context
    };

    const hasPermission = await PermissionService.checkPermission(
      ctx.user._id,
      requiredPermission,
      context
    );

    if (!hasPermission) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `You don't have permission: ${requiredPermission}`
      });
    }

    return next({ ctx });
  });
};

export { z };