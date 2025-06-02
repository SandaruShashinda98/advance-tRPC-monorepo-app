import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Save, 
  X, 
  Plus, 
  Eye, 
  EyeOff, 
  FileText, 
  User, 
  Globe, 
  Lock,
  Tag
} from 'lucide-react';
import { trpc } from '../../utils/trpc';
import { useAuth } from '../../hooks/useAuth';
import { usePermissions } from '../../hooks/usePermissions';
import { PERMISSIONS } from '../../utils/permissions';
import toast from 'react-hot-toast';
import Loading from '../common/Loading';

const PostForm = () => {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  const { user } = useAuth();
  const { checkPermission } = usePermissions();
  const utils = trpc.useUtils();

  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [preview, setPreview] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty }
  } = useForm({
    defaultValues: {
      title: '',
      content: '',
      status: 'published',
      isPublic: true,
      authorId: ''
    }
  });

  const watchedValues = watch();

  // Fetch post data if editing
  const { data: postData, isLoading: postLoading } = trpc.post.getById.useQuery(
    { id: id },
    { enabled: isEditing }
  );

  // Fetch users for author selection (admin only)
  const { data: users } = trpc.user.getAll.useQuery(
    undefined,
    { enabled: checkPermission(PERMISSIONS.USER_READ) }
  );

  useEffect(() => {
    if (postData && isEditing) {
      setValue('title', postData.title);
      setValue('content', postData.content);
      setValue('status', postData.status);
      setValue('isPublic', postData.isPublic);
      setValue('authorId', postData.author._id);
      setTags(postData.tags || []);
    } else if (!isEditing) {
      // Set default author for new posts
      setValue('authorId', user?._id || '');
    }
  }, [postData, isEditing, setValue, user]);

  const createMutation = trpc.post.create.useMutation({
    onSuccess: () => {
      utils.post.getAll.invalidate();
      utils.post.getMyPosts.invalidate();
      toast.success('Post created successfully');
      navigate('/my-posts');
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const updateMutation = trpc.post.update.useMutation({
    onSuccess: () => {
      utils.post.getAll.invalidate();
      utils.post.getMyPosts.invalidate();
      toast.success('Post updated successfully');
      navigate('/my-posts');
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const onSubmit = (data) => {
    // Convert string values to proper types
    const postData = {
      title: data.title,
      content: data.content,
      status: data.status,
      isPublic: data.isPublic === 'true' || data.isPublic === true,
      tags,
      ...(data.authorId && { authorId: data.authorId })
    };

    if (isEditing) {
      updateMutation.mutate({ id, ...postData });
    } else {
      createMutation.mutate(postData);
    }
  };

  const addTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < 10) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const wordCount = watchedValues.content ? watchedValues.content.split(/\s+/).filter(word => word.length > 0).length : 0;
  const charCount = watchedValues.content ? watchedValues.content.length : 0;

  if (isEditing && postLoading) {
    return <Loading text="Loading post..." />;
  }

  const isLoading = createMutation.isLoading || updateMutation.isLoading;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="h-6 w-6 text-gray-400 mr-3" />
                <h1 className="text-xl font-semibold text-gray-900">
                  {isEditing ? 'Edit Post' : 'Create New Post'}
                </h1>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setPreview(!preview)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {preview ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                  {preview ? 'Edit' : 'Preview'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title */}
              <div className="bg-white shadow rounded-lg p-6">
                <div className="mb-4">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    {...register('title', { required: 'Title is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter post title..."
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="bg-white shadow rounded-lg p-6">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                      Content *
                    </label>
                    <span className="text-xs text-gray-500">
                      {wordCount} words, {charCount} characters
                    </span>
                  </div>
                  
                  {!preview ? (
                    <textarea
                      id="content"
                      rows={16}
                      {...register('content', { required: 'Content is required' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 resize-none"
                      placeholder="Write your post content here..."
                    />
                  ) : (
                    <div className="w-full min-h-[400px] px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                      <div className="prose max-w-none">
                        {watchedValues.content ? (
                          <div className="whitespace-pre-wrap">{watchedValues.content}</div>
                        ) : (
                          <p className="text-gray-500 italic">Content preview will appear here...</p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {errors.content && (
                    <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
                  )}
                </div>
              </div>

              {/* Tags */}
              <div className="bg-white shadow rounded-lg p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags (optional)
                  </label>
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="flex-1 relative">
                      <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={handleTagKeyPress}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Add a tag..."
                        maxLength={30}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={addTag}
                      disabled={!tagInput.trim() || tags.length >= 10}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-600 focus:outline-none"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <p className="mt-1 text-xs text-gray-500">
                    Add up to 10 tags to help categorize your post. Press Enter to add.
                  </p>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Publish Settings */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Publish Settings</h3>
                
                {/* Status */}
                <div className="mb-4">
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    id="status"
                    {...register('status')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                {/* Visibility */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Visibility
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        {...register('isPublic')}
                        value="true"
                        className="form-radio h-4 w-4 text-blue-600"
                      />
                      <span className="ml-2 flex items-center text-sm text-gray-700">
                        <Globe className="h-4 w-4 mr-2 text-green-500" />
                        Public
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        {...register('isPublic')}
                        value="false"
                        className="form-radio h-4 w-4 text-blue-600"
                      />
                      <span className="ml-2 flex items-center text-sm text-gray-700">
                        <Lock className="h-4 w-4 mr-2 text-red-500" />
                        Private
                      </span>
                    </label>
                  </div>
                </div>

                {/* Author Selection (Admin only) */}
                {checkPermission(PERMISSIONS.USER_READ) && users && (
                  <div className="mb-4">
                    <label htmlFor="authorId" className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="inline h-4 w-4 mr-1" />
                      Author
                    </label>
                    <select
                      id="authorId"
                      {...register('authorId')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Author</option>
                      {users.map((user) => (
                        <option key={user._id} value={user._id}>
                          {user.name} ({user.email})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Save Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {isEditing ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {isEditing ? 'Update Post' : 'Create Post'}
                    </>
                  )}
                </button>
              </div>

              {/* Post Info (when editing) */}
              {isEditing && postData && (
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Post Information</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Created:</span>
                      <span className="ml-2 text-gray-600">
                        {new Date(postData.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Updated:</span>
                      <span className="ml-2 text-gray-600">
                        {new Date(postData.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Author:</span>
                      <span className="ml-2 text-gray-600">
                        {postData.author.name}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostForm;