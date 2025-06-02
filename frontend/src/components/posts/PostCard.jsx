import React from 'react';
import { Link } from 'react-router-dom';
import { Edit, Trash2, Eye, Calendar, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const PostCard = ({ post, onEdit, onDelete, isDeleting = false }) => {
  const { user } = useAuth();

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
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return 'Unknown date';
    }
  };

  const truncateContent = (content, maxLength = 150) => {
    if (!content) return '';
    return content.length > maxLength 
      ? content.substring(0, maxLength) + '...' 
      : content;
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className="p-6">
        {/* Status Badge */}
        <div className="flex items-center justify-between mb-3">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(post.status)}`}>
            {post.status?.charAt(0).toUpperCase() + post.status?.slice(1)}
          </span>
          {!post.isPublic && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              Private
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-medium text-gray-900 mb-2 line-clamp-2">
          {post.title || 'Untitled Post'}
        </h3>

        {/* Content Preview */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {truncateContent(post.content)}
        </p>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {post.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
              >
                {tag}
              </span>
            ))}
            {post.tags.length > 3 && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                +{post.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Author & Date */}
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <User className="h-4 w-4 mr-1" />
          <span className="mr-4">
            {post.author?.name || 'Unknown Author'}
          </span>
          <Calendar className="h-4 w-4 mr-1" />
          <span>{formatDate(post.createdAt)}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <Link
            to={`/posts/${post._id}`}
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500 transition-colors"
          >
            <Eye className="h-4 w-4 mr-1" />
            View
          </Link>

          <div className="flex items-center space-x-2">
            {onEdit && (
              <button
                onClick={onEdit}
                className="inline-flex items-center text-sm text-gray-600 hover:text-gray-500 transition-colors"
                title="Edit post"
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </button>
            )}

            {onDelete && (
              <button
                onClick={onDelete}
                disabled={isDeleting}
                className="inline-flex items-center text-sm text-red-600 hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Delete post"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCard;