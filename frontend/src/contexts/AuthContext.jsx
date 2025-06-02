import React, { createContext, useState, useEffect } from 'react';
import { trpc } from '../utils/trpc';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const { data: currentUser, isLoading: userLoading, error } = trpc.auth.me.useQuery(
    undefined,
    {
      retry: false,
      onError: (error) => {
        if (error.data?.code === 'UNAUTHORIZED') {
          Cookies.remove('token');
          setUser(null);
        }
      }
    }
  );

  useEffect(() => {
    if (!userLoading) {
      setUser(currentUser || null);
      setIsLoading(false);
    }
  }, [currentUser, userLoading]);

  const login = (userData, token) => {
    setUser(userData);
    Cookies.set('token', token, { expires: 7 });
    toast.success('Login successful!');
  };

  const logout = () => {
    setUser(null);
    Cookies.remove('token');
    toast.success('Logged out successfully');
  };

  const updateUser = (updatedUserData) => {
    setUser(prev => ({ ...prev, ...updatedUserData }));
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
    updateUser,
    isAuthenticated: !!user,
    hasRole: (role) => user?.roles?.some(r => r.name === role) || false,
    hasPermission: (permission) => user?.permissions?.includes(permission) || false
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};