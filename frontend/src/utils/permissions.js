// Mirror the backend permissions
export const PERMISSIONS = {
  // User permissions
  USER_CREATE: "user.create",
  USER_READ: "user.read",
  USER_UPDATE: "user.update",
  USER_UPDATE_OWN: "user.update.own",
  USER_DELETE: "user.delete",
  USER_MANAGE: "user.manage",

  // Post permissions
  POST_CREATE: "post.create",
  POST_READ: "post.read",
  POST_UPDATE: "post.update",
  POST_UPDATE_OWN: "post.update.own",
  POST_DELETE: "post.delete",
  POST_DELETE_OWN: "post.delete.own",
  POST_MODERATE: "post.moderate",
  POST_MANAGE: "post.manage",

  // Role permissions
  ROLE_CREATE: "role.create",
  ROLE_READ: "role.read",
  ROLE_UPDATE: "role.update",
  ROLE_DELETE: "role.delete",
  ROLE_MANAGE: "role.manage",

  // System permissions
  SYSTEM_MANAGE: "system.manage",
};

export const hasPermission = (
  userPermissions,
  requiredPermission,
  context = {}
) => {
  if (!userPermissions || !Array.isArray(userPermissions)) {
    return false;
  }

  const required = parsePermission(requiredPermission);

  return userPermissions.some((userPerm) => {
    const user = parsePermission(userPerm);

    // Check for exact match
    if (userPerm === requiredPermission) {
      return true;
    }

    // Check for manage permission (includes all actions for resource)
    if (user.resource === required.resource && user.action === "manage") {
      return true;
    }

    // Check for conditional permissions (e.g., update.own)
    if (
      user.resource === required.resource &&
      user.action === required.action &&
      user.condition === "own" &&
      required.condition === "own"
    ) {
      return (
        context.ownerId &&
        context.userId &&
        context.ownerId.toString() === context.userId.toString()
      );
    }

    // Check if user has broader permission than required
    if (
      user.resource === required.resource &&
      user.action === required.action &&
      !user.condition &&
      required.condition
    ) {
      return true;
    }

    return false;
  });
};

const parsePermission = (permission) => {
  const parts = permission.split(".");
  return {
    resource: parts[0],
    action: parts[1],
    condition: parts[2] || null,
  };
};

export const groupPermissionsByResource = (permissions) => {
  const grouped = {};
  permissions.forEach((permission) => {
    const { resource } = parsePermission(permission);
    if (!grouped[resource]) {
      grouped[resource] = [];
    }
    grouped[resource].push(permission);
  });
  return grouped;
};
