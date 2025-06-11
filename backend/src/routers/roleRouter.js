import { router, createPermissionProcedure, z } from "../trpc.js";
import { Role } from "../models/Role.js";
import { RoleService } from "../services/roleService.js";
import { PERMISSIONS } from "../utils/permissions.js";
import { TRPCError } from "@trpc/server";
import { roleValidation } from "../utils/validations/roleValidation.js";

export const roleRouter = router({
  // Get all roles (requires role.read permission)
  getAll: createPermissionProcedure(PERMISSIONS.ROLE_READ).query(async () => {
    try {
      const roles = await Role.find().sort({ name: 1 });
      return roles;
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch roles",
      });
    }
  }),

  // Get role by ID (requires role.read permission)
  getById: createPermissionProcedure(PERMISSIONS.ROLE_READ)
    .input(roleValidation.IDValidation())
    .query(async ({ input }) => {
      try {
        const role = await Role.findById(input.id);

        if (!role) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Role not found",
          });
        }

        return role;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch role",
        });
      }
    }),

  // Create role (requires role.create permission)
  create: createPermissionProcedure(PERMISSIONS.ROLE_CREATE)
    .input(roleValidation.createRoleValidation())
    .mutation(async ({ input }) => {
      try {
        const role = await RoleService.createRole(input);
        return role;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        if (error.code === 11000) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Role with this name already exists",
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create role",
        });
      }
    }),

  // Update role (requires role.update permission)
  update: createPermissionProcedure(PERMISSIONS.ROLE_UPDATE)
    .input(roleValidation.updateRoleValidation())
    .mutation(async ({ input }) => {
      try {
        const { id, ...updateData } = input;

        const role = await Role.findById(id);
        if (!role) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Role not found",
          });
        }

        if (role.isSystem && updateData.name) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Cannot rename system roles",
          });
        }

        const updatedRole = await Role.findByIdAndUpdate(id, updateData, {
          new: true,
        });
        return updatedRole;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update role",
        });
      }
    }),

  // Delete role (requires role.delete permission)
  delete: createPermissionProcedure(PERMISSIONS.ROLE_DELETE)
    .input(roleValidation.IDValidation())
    .mutation(async ({ input }) => {
      try {
        const role = await Role.findById(input.id);
        if (!role) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Role not found",
          });
        }

        if (role.isSystem) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Cannot delete system roles",
          });
        }

        await Role.findByIdAndDelete(input.id);
        return { message: "Role deleted successfully" };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete role",
        });
      }
    }),

  // Add permission to role (requires role.update permission)
  addPermission: createPermissionProcedure(PERMISSIONS.ROLE_UPDATE)
    .input(roleValidation.rolePermissionValidation())
    .mutation(async ({ input }) => {
      try {
        const success = await RoleService.addPermissionToRole(
          input.roleId,
          input.permission
        );
        if (!success) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Failed to add permission to role",
          });
        }
        return { message: "Permission added to role successfully" };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to add permission to role",
        });
      }
    }),

  // Remove permission from role (requires role.update permission)
  removePermission: createPermissionProcedure(PERMISSIONS.ROLE_UPDATE)
    .input(roleValidation.rolePermissionValidation())
    .mutation(async ({ input }) => {
      try {
        const success = await RoleService.removePermissionFromRole(
          input.roleId,
          input.permission
        );
        if (!success) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Failed to remove permission from role",
          });
        }
        return { message: "Permission removed from role successfully" };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to remove permission from role",
        });
      }
    }),

  // Get available permissions
  getAvailablePermissions: createPermissionProcedure(
    PERMISSIONS.ROLE_READ
  ).query(async () => {
    try {
      return Object.values(PERMISSIONS);
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch available permissions",
      });
    }
  }),
});
