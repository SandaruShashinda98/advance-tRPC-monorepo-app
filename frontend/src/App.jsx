import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import { trpc, createTRPCClient } from './utils/trpc';
import { AuthProvider } from './contexts/AuthContext';
import { PermissionProvider } from './contexts/PermissionContext';

import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ErrorBoundary from './components/common/ErrorBoundary';

// Auth Components
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';

import { useAuth } from './hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import UserList from './components/users/UserList';

// Dashboard
import Dashboard from './components/dashboard/Dashboard';

// Post Components
// import PostList from './components/posts/PostList';
// import PostForm from './components/posts/PostForm';
// import PostDetail from './components/posts/PostDetail';

// User Components

// Role Components
// import RoleList from './components/roles/RoleList';

// Admin Components
// import AdminPanel from './components/admin/AdminPanel';

import { PERMISSIONS } from './utils/permissions';
import UserProfile from './components/auth/UserProfile';
import PostList from './components/posts/PostList';
import PostForm from './components/posts/PostForm';
import PostDetail from './components/posts/PostDetail';

function App() {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        retry: (failureCount, error) => {
          // Don't retry on authentication/authorization errors
          if (error?.data?.code === 'UNAUTHORIZED' || error?.data?.code === 'FORBIDDEN') {
            return false;
          }
          return failureCount < 3;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
      },
      mutations: {
        retry: 1,
      }
    }
  }));

  const [trpcClient] = useState(() => createTRPCClient());

  return (
    <ErrorBoundary>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <PermissionProvider>
              <Router>
                <Layout>
                  <Routes>
                    {/* Public Routes */}
                    <Route 
                      path="/login" 
                      element={
                        <PublicRoute>
                          <LoginForm />
                        </PublicRoute>
                      } 
                    />
                    <Route 
                      path="/register" 
                      element={
                        <PublicRoute>
                          <RegisterForm />
                        </PublicRoute>
                      } 
                    />

                    {/* Protected Dashboard */}
                    <Route 
                      path="/dashboard" 
                      element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      } 
                    />

                    {/* Profile Route */}
                    <Route 
                      path="/profile" 
                      element={
                        <ProtectedRoute>
                          <UserProfile />
                        </ProtectedRoute>
                      } 
                    />

                    {/* Posts Routes */}
                    <Route 
                      path="/posts" 
                      element={<PostList />} 
                    />
                    
                    <Route 
                      path="/posts/:id" 
                      element={<PostDetail />} 
                    />
                    
                    <Route 
                      path="/posts/create" 
                      element={
                        <ProtectedRoute requiredPermission={PERMISSIONS.POST_CREATE}>
                          <PostForm />
                        </ProtectedRoute>
                      } 
                    />
                    
                    <Route 
                      path="/posts/edit/:id" 
                      element={
                        <ProtectedRoute>
                          <PostForm />
                        </ProtectedRoute>
                      } 
                    />
                    
                    <Route 
                      path="/my-posts" 
                      element={
                        <ProtectedRoute requiredPermission={PERMISSIONS.POST_CREATE}>
                          <PostList showMyPosts={true} />
                        </ProtectedRoute>
                      } 
                    />

                    {/* User Management Routes */}
                    <Route 
                      path="/users" 
                      element={
                        <ProtectedRoute requiredPermission={PERMISSIONS.USER_READ}>
                          <UserList />
                        </ProtectedRoute>
                      } 
                    />
                    
                    <Route 
                      path="/users/:id" 
                      element={
                        <ProtectedRoute requiredPermission={PERMISSIONS.USER_READ}>
                          <UserProfile />
                        </ProtectedRoute>
                      } 
                    />

                    {/* Role Management Routes */}
                    {/* <Route 
                      path="/roles" 
                      element={
                        <ProtectedRoute requiredPermission={PERMISSIONS.ROLE_READ}>
                          <RoleList />
                        </ProtectedRoute>
                      } 
                    /> */}

                    {/* Admin Panel Routes */}
                    {/* <Route 
                      path="/admin" 
                      element={
                        <ProtectedRoute requiredPermission={PERMISSIONS.SYSTEM_MANAGE}>
                          <AdminPanel />
                        </ProtectedRoute>
                      } 
                    /> */}
                    
                    <Route 
                      path="/admin/users" 
                      element={
                        <ProtectedRoute requiredPermission={PERMISSIONS.USER_MANAGE}>
                          <UserList />
                        </ProtectedRoute>
                      } 
                    />
                    
                    {/* <Route 
                      path="/admin/roles" 
                      element={
                        <ProtectedRoute requiredPermission={PERMISSIONS.ROLE_MANAGE}>
                          <RoleList />
                        </ProtectedRoute>
                      } 
                    /> */}

                    {/* Settings Route */}
                    <Route 
                      path="/settings" 
                      element={
                        <ProtectedRoute>
                          <UserProfile />
                        </ProtectedRoute>
                      } 
                    />

                    {/* Default Redirects */}
                    <Route 
                      path="/" 
                      element={<Navigate to="/dashboard" replace />} 
                    />

                    {/* 404 Not Found */}
                    <Route 
                      path="*" 
                      element={<NotFoundPage />} 
                    />
                  </Routes>
                </Layout>
              </Router>

              {/* Global Toast Notifications */}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                    fontSize: '14px',
                    borderRadius: '8px',
                    padding: '12px 16px',
                  },
                  success: {
                    duration: 3000,
                    style: {
                      background: '#10b981',
                    },
                    iconTheme: {
                      primary: '#fff',
                      secondary: '#10b981',
                    },
                  },
                  error: {
                    duration: 5000,
                    style: {
                      background: '#ef4444',
                    },
                    iconTheme: {
                      primary: '#fff',
                      secondary: '#ef4444',
                    },
                  },
                  loading: {
                    style: {
                      background: '#3b82f6',
                    },
                  },
                }}
              />
            </PermissionProvider>
          </AuthProvider>
        </QueryClientProvider>
      </trpc.Provider>
    </ErrorBoundary>
  );
}

// Public Route Component (redirects authenticated users to dashboard)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// 404 Not Found Page Component
const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-200">404</h1>
          <div className="text-4xl font-bold text-gray-800 mb-4">Page Not Found</div>
          <p className="text-gray-600 mb-8">
            Sorry, the page you are looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={() => navigate(-1)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
          >
            Go Back
          </button>
          
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
          >
            Go to Dashboard
          </button>
        </div>
        
        <div className="mt-8 text-sm text-gray-500">
          <p>
            If you believe this is an error, please contact support or check your permissions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default App;