import { TRPCError } from "@trpc/server";
import { User } from "../models/User.js";
import { PERMISSIONS } from "../utils/permissions.js";
import { PermissionService } from "./permissionService.js";

export class UserService {
  async getAllUsers() {
    try {
      const users = await User.find()
        .populate("roles", "name description permissions")
        .sort({ createdAt: -1 });
      return users;
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch users",
      });
    }
  }

  async getUserById(input, ctx) {
    try {
      const isOwnProfile = input.id === ctx.user._id.toString();

      if (!isOwnProfile) {
        const hasPermission = await PermissionService.checkPermission(
          ctx.user._id,
          PERMISSIONS.USER_READ
        );

        if (!hasPermission) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You can only view your own profile",
          });
        }
      }

      const user = await User.findById(input.id).populate(
        "roles",
        "name description permissions"
      );

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      return user;
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch user",
      });
    }
  }

  async updateUser(input, ctx) {
    try {
      const { id, ...updateData } = input;
      const isOwnProfile = id === ctx.user._id.toString();

      // Check permissions
      let hasPermission = false;
      if (isOwnProfile) {
        hasPermission = await PermissionService.checkPermission(
          ctx.user._id,
          PERMISSIONS.USER_UPDATE_OWN,
          { ownerId: ctx.user._id }
        );
      } else {
        hasPermission = await PermissionService.checkPermission(
          ctx.user._id,
          PERMISSIONS.USER_UPDATE
        );
      }

      if (!hasPermission) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to update this user",
        });
      }

      // Users can't deactivate themselves
      if (isOwnProfile && updateData.isActive === false) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You cannot deactivate your own account",
        });
      }

      const user = await User.findByIdAndUpdate(id, updateData, {
        new: true,
      }).populate("roles", "name description permissions");

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      return user;
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to update user",
      });
    }
  }

  async deleteUser(input, ctx) {
    try {
      if (input.id === ctx.user._id.toString()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You cannot delete your own account",
        });
      }

      const user = await User.findByIdAndDelete(input.id);
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      return { message: "User deleted successfully" };
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to delete user",
      });
    }
  }

  async assignRoleToUser(input) {
    try {
      const success = await PermissionService.assignRoleToUser(
        input.userId,
        input.roleId
      );
      if (!success) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Failed to assign role to user",
        });
      }
      return { message: "Role assigned successfully" };
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to assign role",
      });
    }
  }

  async removeRoleFromUser(input) {
    try {
      const success = await PermissionService.removeRoleFromUser(
        input.userId,
        input.roleId
      );
      if (!success) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Failed to remove role from user",
        });
      }
      return { message: "Role removed successfully" };
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to remove role",
      });
    }
  }

  async assignPermissionToUser(input) {
    try {
      const success = await PermissionService.assignPermissionToUser(
        input.userId,
        input.permission
      );
      if (!success) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Failed to assign permission to user",
        });
      }
      return { message: "Permission assigned successfully" };
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to assign permission",
      });
    }
  }

  async removePermissionFromUser(input) {
    try {
      const success = await PermissionService.removePermissionFromUser(
        input.userId,
        input.permission
      );
      if (!success) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Failed to remove permission from user",
        });
      }
      return { message: "Permission removed successfully" };
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to remove permission",
      });
    }
  }

  async getUserPermissions(input, ctx) {
    try {
      const isOwnProfile = input.userId === ctx.user._id.toString();

      if (!isOwnProfile) {
        const hasPermission = await PermissionService.checkPermission(
          ctx.user._id,
          PERMISSIONS.USER_READ
        );

        if (!hasPermission) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You can only view your own permissions",
          });
        }
      }

      const permissions = await PermissionService.getUserPermissions(
        input.userId
      );
      return permissions;
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch user permissions",
      });
    }
  }
}
