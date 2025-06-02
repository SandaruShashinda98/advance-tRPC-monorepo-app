import { useAuth } from './useAuth';
import { hasPermission } from '../utils/permissions';

export const usePermissions = () => {
  const { user } = useAuth();

  const checkPermission = (requiredPermission, context = {}) => {
    if (!user || !user.permissions) return false;
    return hasPermission(user.permissions, requiredPermission, {
      ...context,
      userId: user._id
    });
  };

  const canCreate = (resource) => checkPermission(`${resource}.create`);
  const canRead = (resource) => checkPermission(`${resource}.read`);
  const canUpdate = (resource, ownerId = null) => {
    if (ownerId && ownerId === user?._id) {
      return checkPermission(`${resource}.update.own`, { ownerId, userId: user._id });
    }
    return checkPermission(`${resource}.update`);
  };
  const canDelete = (resource, ownerId = null) => {
    if (ownerId && ownerId === user?._id) {
      return checkPermission(`${resource}.delete.own`, { ownerId, userId: user._id });
    }
    return checkPermission(`${resource}.delete`);
  };
  const canManage = (resource) => checkPermission(`${resource}.manage`);

  return {
    checkPermission,
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    canManage,
    permissions: user?.permissions || []
  };
};