import React from "react";
import { usePermissions } from "../../hooks/usePermissions";
import { useAuth } from "../../hooks/useAuth";

const PermissionGate = ({
  permission,
  ownerId = null,
  fallback = null,
  children,
}) => {
  const { checkPermission } = usePermissions();
  const { user } = useAuth();

  const hasAccess = checkPermission(permission, {
    ownerId,
    userId: user?._id,
  });

  if (!hasAccess) {
    return fallback;
  }

  return children;
};

export default PermissionGate;
