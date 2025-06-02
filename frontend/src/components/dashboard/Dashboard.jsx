import React from "react";
import { Link } from "react-router-dom";
import {
  Users,
  FileText,
  Shield,
  PlusCircle,
  BarChart3,
  Eye,
  Settings,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { usePermissions } from "../../hooks/usePermissions";
import { trpc } from "../../utils/trpc";
import { PERMISSIONS } from "../../utils/permissions";
import Loading from "../common/Loading";

const Dashboard = () => {
  const { user } = useAuth();
  const { checkPermission } = usePermissions();

  // Check permissions first
  const canReadUsers = checkPermission(PERMISSIONS.USER_READ);
  const canReadRoles = checkPermission(PERMISSIONS.ROLE_READ);
  const canCreatePosts = checkPermission(PERMISSIONS.POST_CREATE);

  // Fetch dashboard stats based on permissions
  const { data: posts, isLoading: postsLoading } = trpc.post.getAll.useQuery({
    limit: 5,
  });

  const { data: users, isLoading: usersLoading } = trpc.user.getAll.useQuery(
    undefined,
    {
      enabled: canReadUsers,
    }
  );

  const { data: roles, isLoading: rolesLoading } = trpc.role.getAll.useQuery(
    undefined,
    {
      enabled: canReadRoles,
    }
  );

  const { data: myPosts, isLoading: myPostsLoading } =
    trpc.post.getMyPosts.useQuery(
      {
        limit: 5,
      },
      {
        enabled: canCreatePosts,
      }
    );

  const statsCards = [
    {
      title: "Total Posts",
      value: posts?.total || 0,
      icon: FileText,
      color: "blue",
      show: true,
      link: "/posts",
    },
    {
      title: "My Posts",
      value: myPosts?.total || 0,
      icon: PlusCircle,
      color: "green",
      show: canCreatePosts,
      link: "/my-posts",
    },
    {
      title: "Total Users",
      value: users?.length || 0,
      icon: Users,
      color: "purple",
      show: canReadUsers,
      link: "/users",
    },
    {
      title: "Roles",
      value: roles?.length || 0,
      icon: Shield,
      color: "orange",
      show: canReadRoles,
      link: "/roles",
    },
  ].filter((card) => card.show);

  const quickActions = [
    {
      title: "Create Post",
      description: "Write a new post",
      icon: PlusCircle,
      color: "green",
      link: "/posts/create",
      show: canCreatePosts,
    },
    {
      title: "View Posts",
      description: "Browse all posts",
      icon: Eye,
      color: "blue",
      link: "/posts",
      show: true,
    },
    {
      title: "Manage Users",
      description: "User administration",
      icon: Users,
      color: "purple",
      link: "/users",
      show: canReadUsers,
    },
    {
      title: "Manage Roles",
      description: "Role administration",
      icon: Shield,
      color: "orange",
      link: "/roles",
      show: canReadRoles,
    },
    {
      title: "Profile Settings",
      description: "Update your profile",
      icon: Settings,
      color: "gray",
      link: "/profile",
      show: true,
    },
  ].filter((action) => action.show);

  const getColorClasses = (color) => {
    const colors = {
      blue: "bg-blue-500 text-blue-600 bg-blue-50",
      green: "bg-green-500 text-green-600 bg-green-50",
      purple: "bg-purple-500 text-purple-600 bg-purple-50",
      orange: "bg-orange-500 text-orange-600 bg-orange-50",
      gray: "bg-gray-500 text-gray-600 bg-gray-50",
    };
    return colors[color] || colors.blue;
  };

  // Only show loading if we're actually loading data the user can access
  const isLoadingRelevantData = 
    postsLoading || 
    (canReadUsers && usersLoading) || 
    (canReadRoles && rolesLoading) || 
    (canCreatePosts && myPostsLoading);

  if (isLoadingRelevantData) {
    return <Loading text="Loading dashboard..." />;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="ml-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-gray-600">
              Here's what's happening with your account today.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {statsCards.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((card, index) => {
            const Icon = card.icon;
            const colorClasses = getColorClasses(card.color).split(" ");

            return (
              <Link
                key={index}
                to={card.link}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow duration-200"
              >
                <div className="flex items-center">
                  <div
                    className={`flex-shrink-0 h-12 w-12 rounded-lg ${colorClasses[2]} flex items-center justify-center`}
                  >
                    <Icon className={`h-6 w-6 ${colorClasses[1]}`} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      {card.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {card.value}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Quick Actions */}
      {quickActions.length > 0 && (
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              const colorClasses = getColorClasses(action.color).split(" ");

              return (
                <Link
                  key={index}
                  to={action.link}
                  className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-center">
                    <div
                      className={`flex-shrink-0 h-10 w-10 rounded-lg ${colorClasses[2]} flex items-center justify-center`}
                    >
                      <Icon className={`h-5 w-5 ${colorClasses[1]}`} />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {action.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Posts */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Posts</h3>
          </div>
          <div className="p-6">
            {posts?.posts && posts.posts.length > 0 ? (
              <div className="space-y-4">
                {posts.posts.slice(0, 3).map((post) => (
                  <div key={post._id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <FileText className="h-4 w-4 text-gray-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {post.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        by {post.author?.name || 'Unknown'} •{" "}
                        {new Date(post.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
                <Link
                  to="/posts"
                  className="text-sm text-blue-600 hover:text-blue-500 font-medium"
                >
                  View all posts →
                </Link>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No posts available</p>
            )}
          </div>
        </div>

        {/* My Recent Posts or User's Permissions */}
        {canCreatePosts ? (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                My Recent Posts
              </h3>
            </div>
            <div className="p-6">
              {myPosts?.posts && myPosts.posts.length > 0 ? (
                <div className="space-y-4">
                  {myPosts.posts.slice(0, 3).map((post) => (
                    <div key={post._id} className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                          <PlusCircle className="h-4 w-4 text-green-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {post.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          {post.status} •{" "}
                          {new Date(post.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  <Link
                    to="/my-posts"
                    className="text-sm text-blue-600 hover:text-blue-500 font-medium"
                  >
                    View all my posts →
                  </Link>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-gray-500 text-sm mb-3">No posts yet</p>
                  <Link
                    to="/posts/create"
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200"
                  >
                    <PlusCircle className="h-4 w-4 mr-1" />
                    Create your first post
                  </Link>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Your Access Level
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-blue-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {user?.roles?.map((role) => role.name).join(", ") ||
                        "No roles assigned"}
                    </p>
                    <p className="text-xs text-gray-500">Current roles</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-green-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {user?.permissions?.length || 0} permissions
                    </p>
                    <p className="text-xs text-gray-500">Active permissions</p>
                  </div>
                </div>
                <Link
                  to="/profile"
                  className="text-sm text-blue-600 hover:text-blue-500 font-medium"
                >
                  View detailed permissions →
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User Capabilities Summary */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Your Capabilities
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* User Management */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                User Management
              </h4>
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  <span className="text-xs text-gray-600">
                    Update own profile
                  </span>
                </div>
                {canReadUsers ? (
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                    <span className="text-xs text-gray-600">View users</span>
                  </div>
                ) : null}
                {checkPermission(PERMISSIONS.USER_MANAGE) ? (
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                    <span className="text-xs text-gray-600">Manage users</span>
                  </div>
                ) : null}
                {!canReadUsers && !checkPermission(PERMISSIONS.USER_MANAGE) && (
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-gray-300 rounded-full mr-2"></div>
                    <span className="text-xs text-gray-400">
                      Limited access
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Content Management */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                Content Management
              </h4>
              <div className="space-y-2">
                {canCreatePosts ? (
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                    <span className="text-xs text-gray-600">Create posts</span>
                  </div>
                ) : null}
                {checkPermission(PERMISSIONS.POST_UPDATE_OWN) ? (
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                    <span className="text-xs text-gray-600">
                      Edit own posts
                    </span>
                  </div>
                ) : null}
                {checkPermission(PERMISSIONS.POST_MODERATE) ? (
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                    <span className="text-xs text-gray-600">
                      Moderate posts
                    </span>
                  </div>
                ) : null}
                {!canCreatePosts && (
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-gray-300 rounded-full mr-2"></div>
                    <span className="text-xs text-gray-400">
                      Read-only access
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Administration */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                Administration
              </h4>
              <div className="space-y-2">
                {canReadRoles ? (
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                    <span className="text-xs text-gray-600">View roles</span>
                  </div>
                ) : null}
                {checkPermission(PERMISSIONS.ROLE_MANAGE) ? (
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                    <span className="text-xs text-gray-600">Manage roles</span>
                  </div>
                ) : null}
                {checkPermission(PERMISSIONS.SYSTEM_MANAGE) ? (
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                    <span className="text-xs text-gray-600">
                      System administration
                    </span>
                  </div>
                ) : null}
                {!canReadRoles && 
                 !checkPermission(PERMISSIONS.ROLE_MANAGE) && 
                 !checkPermission(PERMISSIONS.SYSTEM_MANAGE) && (
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-gray-300 rounded-full mr-2"></div>
                    <span className="text-xs text-gray-400">
                      No admin access
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;