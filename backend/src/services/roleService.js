import { Role } from '../models/Role.js';
import { PERMISSIONS } from '../utils/permissions.js';

export class RoleService {
  static async createRole(roleData) {
    try {
      // Validate permissions
      if (roleData.permissions) {
        const invalidPermissions = roleData.permissions.filter(
          p => !Object.values(PERMISSIONS).includes(p)
        );
        if (invalidPermissions.length > 0) {
          throw new Error(`Invalid permissions: ${invalidPermissions.join(', ')}`);
        }
      }

      const role = new Role(roleData);
      await role.save();
      return role;
    } catch (error) {
      console.error('Create role error:', error);
      throw error;
    }
  }

  static async addPermissionToRole(roleId, permission) {
    try {
      if (!Object.values(PERMISSIONS).includes(permission)) {
        throw new Error('Invalid permission');
      }

      const role = await Role.findById(roleId);
      if (!role) {
        throw new Error('Role not found');
      }

      if (!role.permissions.includes(permission)) {
        role.permissions.push(permission);
        await role.save();
      }

      return true;
    } catch (error) {
      console.error('Add permission to role error:', error);
      return false;
    }
  }

  static async removePermissionFromRole(roleId, permission) {
    try {
      const role = await Role.findById(roleId);
      if (!role) {
        throw new Error('Role not found');
      }

      role.permissions = role.permissions.filter(p => p !== permission);
      await role.save();

      return true;
    } catch (error) {
      console.error('Remove permission from role error:', error);
      return false;
    }
  }
}