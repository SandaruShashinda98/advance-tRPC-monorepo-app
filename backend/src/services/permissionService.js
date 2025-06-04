import { User } from "../models/User.js";
import { Role } from "../models/Role.js";
import { PERMISSIONS } from "../utils/permissions.js";

export class PermissionService {
  async checkPermission(userId, requiredPermission, context = {}) {
    try {
      const user = await User.findById(userId);
      if (!user || !user.isActive) {
        return false;
      }

      return await user.hasPermission(requiredPermission, context);
    } catch (error) {
      console.error("Permission check error:", error);
      return false;
    }
  }

  async getUserPermissions(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        return [];
      }

      return await user.getAllPermissions();
    } catch (error) {
      console.error("Get user permissions error:", error);
      return [];
    }
  }

  async assignPermissionToUser(userId, permission) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      if (!Object.values(PERMISSIONS).includes(permission)) {
        throw new Error("Invalid permission");
      }

      if (!user.directPermissions.includes(permission)) {
        user.directPermissions.push(permission);
        await user.save();
      }

      return true;
    } catch (error) {
      console.error("Assign permission error:", error);
      return false;
    }
  }

  async removePermissionFromUser(userId, permission) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      user.directPermissions = user.directPermissions.filter(
        (p) => p !== permission
      );
      await user.save();

      return true;
    } catch (error) {
      console.error("Remove permission error:", error);
      return false;
    }
  }

  async assignRoleToUser(userId, roleId) {
    try {
      const user = await User.findById(userId);
      const role = await Role.findById(roleId);

      if (!user || !role) {
        throw new Error("User or role not found");
      }

      if (!user.roles.includes(roleId)) {
        user.roles.push(roleId);
        await user.save();
      }

      return true;
    } catch (error) {
      console.error("Assign role error:", error);
      return false;
    }
  }

  async removeRoleFromUser(userId, roleId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      user.roles = user.roles.filter(
        (id) => id.toString() !== roleId.toString()
      );
      await user.save();

      return true;
    } catch (error) {
      console.error("Remove role error:", error);
      return false;
    }
  }
}
