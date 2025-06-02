import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Calendar, 
  User, 
  Eye, 
  Lock, 
  Globe,
  Tag
} from 'lucide-react';
import { trpc } from '../../utils/trpc';
import { useAuth } from '../../hooks/useAuth';
import { usePermissions } from '../../hooks/usePermissions';
import { PERMISSIONS } from '../../utils/permissions';
import Loading from '../common/Loading';
import PermissionGate from '../common/PermissionGate';
import toast from 'react-hot-toast';

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { checkPermission } = usePermissions();
  const utils = trpc.useUtils();

  const { data: post, isLoading, error } = trpc.post.getById.useQuery(
    { id: id },
    { enabled: !!id }
  );

  const deleteMutation = trpc.post.delete.useMutation({
    onSuccess: () => {
      utils.post.getAll.invalidate();
      utils.post.getMyPosts.invalidate();
      toast.success('Post deleted successfully');
      navigate('/posts');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      deleteMutation.mutate({ id: id });
    }
  };

  const canEditPost = () => {
    if (!post || !user) return false;
    return checkPermission(PERMISSIONS.POST_UPDATE, {
      ownerId: post.author._id,
      userId: user._id,
    });
  };

  const canDeletePost = () => {
    if (!post || !user) return false;
    return checkPermission(PERMISSIONS.POST_DELETE, {
      ownerId: post.author._id,
      userId: user._id,
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch (error) {
      return 'Unknown date';
    }
  };

  if (isLoading) {
    return <Loading text="Loading post..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-center">
              <div className="text-red-600 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Post</h3>
              <p className="text-gray-600 mb-4">{error.message}</p>
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Post Not Found</h3>
              <p className="text-gray-600 mb-4">The post you're looking for doesn't exist or has been removed.</p>
              <button
                onClick={() => navigate('/posts')}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Posts
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-500 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </button>
        </div>

        {/* Post Content */}
        <article className="bg-white shadow rounded-lg overflow-hidden">
          {/* Post Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(post.status)}`}>
                  {post.status?.charAt(0).toUpperCase() + post.status?.slice(1)}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  post.isPublic ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {post.isPublic ? (
                    <>
                      <Globe className="h-3 w-3 mr-1" />
                      Public
                    </>
                  ) : (
                    <>
                      <Lock className="h-3 w-3 mr-1" />
                      Private
                    </>
                  )}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                {canEditPost() && (
                  <Link
                    to={`/posts/edit/${post._id}`}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Link>
                )}

                {canDeletePost() && (
                  <button
                    onClick={handleDelete}
                    disabled={deleteMutation.isLoading}
                    className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {deleteMutation.isLoading ? 'Deleting...' : 'Delete'}
                  </button>
                )}
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {post.title}
            </h1>

            {/* Author and Date */}
            <div className="flex items-center text-sm text-gray-500 space-x-4">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                <span>{post.author?.name || 'Unknown Author'}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Created {formatDate(post.createdAt)}</span>
              </div>
              {post.updatedAt !== post.createdAt && (
                <div className="flex items-center">
                  <Eye className="h-4 w-4 mr-1" />
                  <span>Updated {formatDate(post.updatedAt)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Post Body */}
          <div className="px-6 py-8">
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap text-gray-900 leading-relaxed">
                {post.content}
              </div>
            </div>
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center">
                <Tag className="h-4 w-4 text-gray-400 mr-2" />
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </article>

        {/* Related Actions */}
        <div className="mt-6 flex justify-center">
          <Link
            to="/posts"
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            View All Posts
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;