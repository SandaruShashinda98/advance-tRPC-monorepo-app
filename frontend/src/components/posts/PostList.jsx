import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Filter } from "lucide-react";
import { trpc } from "../../utils/trpc";
import { usePermissions } from "../../hooks/usePermissions";
import { useAuth } from "../../hooks/useAuth";
import { PERMISSIONS } from "../../utils/permissions";
import Loading from "../common/Loading";
import PermissionGate from "../common/PermissionGate";
import PostCard from "./PostCard";
import toast from "react-hot-toast";

const PostList = ({ showMyPosts = false }) => {
  const [filters, setFilters] = useState({
    status: "",
    limit: 20,
    offset: 0,
  });

  const { user } = useAuth();
  const { checkPermission } = usePermissions();
  const utils = trpc.useUtils();

  const queryKey = showMyPosts ? "getMyPosts" : "getAll";
  
  // Filter out empty values to avoid validation errors
  const buildApiFilters = (filters) => {
    const apiFilters = {
      limit: filters.limit,
      offset: filters.offset,
    };
    
    // Only include status if it's not empty
    if (filters.status && filters.status.trim() !== "") {
      apiFilters.status = filters.status;
    }
    
    return apiFilters;
  };

  const { data, isLoading, error } = trpc.post[queryKey].useQuery(buildApiFilters(filters));

  const deleteMutation = trpc.post.delete.useMutation({
    onSuccess: () => {
      utils.post.getAll.invalidate();
      utils.post.getMyPosts.invalidate();
      toast.success("Post deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleDelete = (postId) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      deleteMutation.mutate({ id: postId });
    }
  };

  const handleFilterChange = (newStatus) => {
    setFilters(prev => ({
      ...prev,
      status: newStatus,
      offset: 0, // Reset pagination when filter changes
    }));
  };

  const handleLoadMore = () => {
    setFilters(prev => ({
      ...prev,
      offset: prev.offset + prev.limit
    }));
  };

  const canEditPost = (post) => {
    return checkPermission(PERMISSIONS.POST_UPDATE, {
      ownerId: post.author._id,
      userId: user?._id,
    });
  };

  const canDeletePost = (post) => {
    return checkPermission(PERMISSIONS.POST_DELETE, {
      ownerId: post.author._id,
      userId: user?._id,
    });
  };

  if (isLoading) return <Loading text="Loading posts..." />;
  if (error) return <div className="text-red-600">Error: {error.message}</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {showMyPosts ? "My Posts" : "All Posts"}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {data?.total || 0} posts found
          </p>
        </div>

        <PermissionGate permission={PERMISSIONS.POST_CREATE}>
          <Link
            to="/posts/create"
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Post
          </Link>
        </PermissionGate>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex items-center space-x-4">
          <Filter className="h-5 w-5 text-gray-400" />
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Posts Grid */}
      {data?.posts && data.posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onEdit={
                canEditPost(post)
                  ? () => (window.location.href = `/posts/edit/${post._id}`)
                  : null
              }
              onDelete={
                canDeletePost(post) ? () => handleDelete(post._id) : null
              }
              isDeleting={deleteMutation.isLoading}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No posts</h3>
          <p className="mt-1 text-sm text-gray-500">
            {showMyPosts
              ? "You haven't created any posts yet."
              : "No posts available."}
          </p>
          <PermissionGate permission={PERMISSIONS.POST_CREATE}>
            <div className="mt-6">
              <Link
                to="/posts/create"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create your first post
              </Link>
            </div>
          </PermissionGate>
        </div>
      )}

      {/* Load More */}
      {data?.hasMore && (
        <div className="text-center">
          <button
            onClick={handleLoadMore}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
};

export default PostList;