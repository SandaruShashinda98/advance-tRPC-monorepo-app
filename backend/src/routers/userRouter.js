import {
  router,
  protectedProcedure,
  createPermissionProcedure,
} from "../trpc.js";
import { PermissionService } from "../services/permissionService.js";
import { PERMISSIONS } from "../utils/permissions.js";
import { userValidation } from "../utils/validations/userValidation.js";
import { UserService } from "../services/userService.js";

const userService = new UserService();

export const userRouter = router({
  // Get all users (requires user.read permission)
  getAll: createPermissionProcedure(PERMISSIONS.USER_READ).query(async () => {
    const result = await userService.getAllUsers();
    return result;
  }),

  // Get user by ID (requires user.read permission or own profile)
  getById: protectedProcedure
    .input(userValidation.IDValidation())
    .query(async ({ input, ctx }) => {
      const result = await userService.getUserById(input, ctx);
      return result;
    }),

  // Update user
  update: protectedProcedure
    .input(userValidation.updateUser())
    .mutation(async ({ input, ctx }) => {
      const result = await userService.updateUser(input, ctx);
      return result;
    }),

  // Delete user (requires user.delete permission, cannot delete self)
  delete: createPermissionProcedure(PERMISSIONS.USER_DELETE)
    .input(userValidation.IDValidation())
    .mutation(async ({ input, ctx }) => {
      const result = await userService.deleteUser(input, ctx);
      return result;
    }),

  // Assign role to user (requires user.manage permission)
  assignRole: createPermissionProcedure(PERMISSIONS.USER_MANAGE)
    .input(userValidation.userRoleValidation())
    .mutation(async ({ input }) => {
      const result = await PermissionService.assignRoleToUser(input);
      return result;
    }),

  // Remove role from user (requires user.manage permission)
  removeRole: createPermissionProcedure(PERMISSIONS.USER_MANAGE)
    .input(userValidation.userRoleValidation())
    .mutation(async ({ input }) => {
      const result = await PermissionService.removeRoleFromUser(input);
      return result;
    }),

  // Assign direct permission to user (requires user.manage permission)
  assignPermission: createPermissionProcedure(PERMISSIONS.USER_MANAGE)
    .input(userValidation.userPermissionValidation())
    .mutation(async ({ input }) => {
      const result = await PermissionService.assignPermissionToUser(input);
      return result;
    }),

  // Remove direct permission from user (requires user.manage permission)
  removePermission: createPermissionProcedure(PERMISSIONS.USER_MANAGE)
    .input(userValidation.userPermissionValidation())
    .mutation(async ({ input }) => {
      const result = await PermissionService.removePermissionFromUser(input);
      return result;
    }),

  // Get user permissions (own profile or requires user.read permission)
  getUserPermissions: protectedProcedure
    .input(userValidation.IDValidation())
    .query(async ({ input, ctx }) => {
      const result = await userService.getUserPermissions(input, ctx);
      return result;
    }),
});
