export const RESOURCES = {
  USER: "user",
  POST: "post",
  ROLE: "role",
  SYSTEM: "system",
};

export const ACTIONS = {
  CREATE: "create",
  READ: "read",
  UPDATE: "update",
  DELETE: "delete",
  MANAGE: "manage",
  MODERATE: "moderate",
};

// Define all available permissions as enums
export const PERMISSIONS = {
  // User permissions
  USER_CREATE: `${RESOURCES.USER}.${ACTIONS.CREATE}`,
  USER_READ: `${RESOURCES.USER}.${ACTIONS.READ}`,
  USER_UPDATE: `${RESOURCES.USER}.${ACTIONS.UPDATE}`,
  USER_UPDATE_OWN: `${RESOURCES.USER}.${ACTIONS.UPDATE}.own`,
  USER_DELETE: `${RESOURCES.USER}.${ACTIONS.DELETE}`,
  USER_MANAGE: `${RESOURCES.USER}.${ACTIONS.MANAGE}`,

  // Post permissions
  POST_CREATE: `${RESOURCES.POST}.${ACTIONS.CREATE}`,
  POST_READ: `${RESOURCES.POST}.${ACTIONS.READ}`,
  POST_UPDATE: `${RESOURCES.POST}.${ACTIONS.UPDATE}`,
  POST_UPDATE_OWN: `${RESOURCES.POST}.${ACTIONS.UPDATE}.own`,
  POST_DELETE: `${RESOURCES.POST}.${ACTIONS.DELETE}`,
  POST_DELETE_OWN: `${RESOURCES.POST}.${ACTIONS.DELETE}.own`,
  POST_MODERATE: `${RESOURCES.POST}.${ACTIONS.MODERATE}`,
  POST_MANAGE: `${RESOURCES.POST}.${ACTIONS.MANAGE}`,

  // Role permissions
  ROLE_CREATE: `${RESOURCES.ROLE}.${ACTIONS.CREATE}`,
  ROLE_READ: `${RESOURCES.ROLE}.${ACTIONS.READ}`,
  ROLE_UPDATE: `${RESOURCES.ROLE}.${ACTIONS.UPDATE}`,
  ROLE_DELETE: `${RESOURCES.ROLE}.${ACTIONS.DELETE}`,
  ROLE_MANAGE: `${RESOURCES.ROLE}.${ACTIONS.MANAGE}`,

  // System permissions
  SYSTEM_MANAGE: `${RESOURCES.SYSTEM}.${ACTIONS.MANAGE}`,
};

// Permission groups for easier role assignment
export const PERMISSION_GROUPS = {
  USER_BASIC: [
    PERMISSIONS.POST_CREATE,
    PERMISSIONS.POST_READ,
    PERMISSIONS.POST_UPDATE_OWN,
    PERMISSIONS.POST_DELETE_OWN,
    PERMISSIONS.USER_UPDATE_OWN,
  ],

  MODERATOR: [
    PERMISSIONS.POST_READ,
    PERMISSIONS.POST_CREATE,
    PERMISSIONS.POST_UPDATE,
    PERMISSIONS.POST_DELETE,
    PERMISSIONS.POST_MODERATE,
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_UPDATE_OWN,
  ],

  ADMIN: Object.values(PERMISSIONS),
};

// Helper functions for permission checking
export const parsePermission = (permission) => {
  const parts = permission.split(".");
  return {
    resource: parts[0],
    action: parts[1],
    condition: parts[2] || null,
  };
};

export const hasPermission = (
  userPermissions,
  requiredPermission,
  context = {}
) => {
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

export const checkOwnership = (resource, userId, ownerId) => {
  return userId && ownerId && userId.toString() === ownerId.toString();
};
