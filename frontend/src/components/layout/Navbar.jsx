import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, Settings, Shield } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { usePermissions } from '../../hooks/usePermissions';
import { PERMISSIONS } from '../../utils/permissions';
import toast from 'react-hot-toast';
import { trpc } from '../../utils/trpc';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const { checkPermission } = usePermissions();
  const navigate = useNavigate();
  const utils = trpc.useUtils();

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      logout();
      utils.invalidate();
      navigate('/login');
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex-shrink-0 flex items-center">
              <Shield className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">
                Permission App
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              <Link
                to="/dashboard"
                className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Dashboard
              </Link>
              
              <Link
                to="/posts"
                className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Posts
              </Link>

              {checkPermission(PERMISSIONS.POST_CREATE) && (
                <Link
                  to="/my-posts"
                  className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  My Posts
                </Link>
              )}

              {checkPermission(PERMISSIONS.USER_READ) && (
                <Link
                  to="/users"
                  className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Users
                </Link>
              )}

              {checkPermission(PERMISSIONS.ROLE_READ) && (
                <Link
                  to="/roles"
                  className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Roles
                </Link>
              )}
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center">
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <span className="ml-2 text-gray-700 font-medium hidden md:block">
                  {user?.name}
                </span>
              </button>

              {showUserMenu && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                  <div className="py-1">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b">
                      <p className="font-medium">{user?.name}</p>
                      <p className="text-gray-500">{user?.email}</p>
                    </div>
                    
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </Link>
                    
                    <Link
                      to="/settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Link>
                    
                    <button
                      onClick={handleLogout}
                      disabled={logoutMutation.isLoading}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      {logoutMutation.isLoading ? 'Logging out...' : 'Sign out'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden ml-4 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              {isOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50">
            <Link
              to="/dashboard"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:text-blue-600"
              onClick={() => setIsOpen(false)}
            >
              Dashboard
            </Link>
            
            <Link
              to="/posts"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-500 hover:text-blue-600"
              onClick={() => setIsOpen(false)}
            >
              Posts
            </Link>

            {checkPermission(PERMISSIONS.POST_CREATE) && (
              <Link
                to="/my-posts"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-500 hover:text-blue-600"
                onClick={() => setIsOpen(false)}
              >
                My Posts
              </Link>
            )}

            {checkPermission(PERMISSIONS.USER_READ) && (
              <Link
                to="/users"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-500 hover:text-blue-600"
                onClick={() => setIsOpen(false)}
              >
                Users
              </Link>
            )}

            {checkPermission(PERMISSIONS.ROLE_READ) && (
              <Link
                to="/roles"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-500 hover:text-blue-600"
                onClick={() => setIsOpen(false)}
              >
                Roles
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;