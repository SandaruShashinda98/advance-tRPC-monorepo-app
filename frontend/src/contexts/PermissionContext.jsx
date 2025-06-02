import React, { createContext, useContext } from 'react';
import { useAuth } from '../hooks/useAuth';
import { hasPermission } from '../utils/permissions';

const PermissionContext = createContext();

export const PermissionProvider = ({ children }) => {
  const { user } = useAuth();

  const checkPermission = (requiredPermission, context = {}) => {
    if (!user || !user.permissions) return false;
    return hasPermission(user.permissions, requiredPermission, {
      ...context,
      userId: user._id
    });
  };

  const value = {
    checkPermission,
    permissions: user?.permissions || []
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermissionContext = () => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermissionContext must be used within PermissionProvider');
  }
  return context;
};