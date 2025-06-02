import React, { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import {
  User,
  Edit,
  Save,
  X,
  Lock,
  Mail,
  Calendar,
  Shield,
  Activity,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  AlertTriangle, // Fixed: Renamed and imported correct icon
} from "lucide-react";
import { trpc } from "../../utils/trpc";
import { useAuth } from "../../hooks/useAuth";
import { usePermissions } from "../../hooks/usePermissions";
import toast from "react-hot-toast";
import Loading from "../common/Loading";

const UserProfile = () => {
  const { user, updateUser } = useAuth();
  const { checkPermission } = usePermissions();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const utils = trpc.useUtils();

  // Profile form
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    setValue,
    formState: { errors: profileErrors },
  } = useForm({
    defaultValues: {
      name: user?.name || "",
      age: user?.age ? String(user.age) : "", // Fixed: Convert age to string
    },
  });

  // Password form with confirmation
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    watch: watchPassword,
    formState: { errors: passwordErrors },
  } = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "", // Added: Confirmation field
    },
  });

  const currentPassword = watchPassword("currentPassword");
  const newPassword = watchPassword("newPassword");
  const confirmPassword = watchPassword("confirmPassword");

  React.useEffect(() => {
    if (user) {
      setValue("name", user.name || "");
      setValue("age", user.age ? String(user.age) : "");
    }
  }, [user, setValue]);

  // Mutations
  const updateProfileMutation = trpc.user.update.useMutation({
    onSuccess: (data) => {
      updateUser(data);
      utils.auth.me.invalidate();
      setIsEditing(false);
      toast.success("Profile updated successfully");
    },
    onError: (error) => {
      // Improved: Handle specific error cases
      toast.error(
        error.message || "Failed to update profile. Please try again."
      );
    },
  });

  const changePasswordMutation = trpc.auth.changePassword.useMutation({
    onSuccess: () => {
      setIsChangingPassword(false);
      resetPassword();
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      toast.success("Password changed successfully");
    },
    onError: (error) => {
      toast.error(
        error.message || "Failed to change password. Please try again."
      );
    },
  });

  // Form handlers
  const onProfileSubmit = (data) => {
    updateProfileMutation.mutate({
      id: user?._id || "",
      name: data.name,
      age: parseInt(data.age) || 0,
    });
  };

  const onPasswordSubmit = (data) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error("New password and confirmation do not match");
      return;
    }
    changePasswordMutation.mutate({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
  };

  // Helper functions
  const getPermissionColor = (permission) => {
    const resource = permission.split(".")[0];
    switch (resource) {
      case "user":
        return "bg-blue-50 border-blue-200 text-blue-800";
      case "post":
        return "bg-green-50 border-green-200 text-green-800";
      case "role":
        return "bg-purple-50 border-purple-200 text-purple-800";
      case "system":
        return "bg-red-50 border-red-200 text-red-800";
      default:
        return "bg-gray-50 border-gray-200 text-gray-800";
    }
  };

  const getRoleColor = (roleName) => {
    switch (roleName?.toLowerCase()) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "moderator":
        return "bg-yellow-100 text-yellow-800";
      case "user":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const groupPermissionsByResource = (permissions) => {
    const grouped = {};
    (permissions || []).forEach((permission) => {
      const resource = permission.split(".")[0];
      if (!grouped[resource]) {
        grouped[resource] = [];
      }
      grouped[resource].push(permission);
    });
    return grouped;
  };

  // Memoize grouped permissions to avoid recomputation
  const groupedPermissions = useMemo(
    () => groupPermissionsByResource(user?.permissions || []),
    [user?.permissions]
  );

  if (!user) {
    return <Loading text="Loading profile..." />;
  }

  return (
    <div className="max-w-6xl mx-auto py-6 space-y-6">
      {/* Profile Header */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-8">
          <div className="flex items-center">
            <div className="h-24 w-24 rounded-full bg-white bg-opacity-20 backdrop-blur-sm flex items-center justify-center border-4 border-white border-opacity-30">
              <User className="h-12 w-12 text-white" />
            </div>
            <div className="ml-6 text-white">
              <h1 className="text-3xl font-bold">
                {user.name || "Unknown User"}
              </h1>
              <p className="text-blue-100 flex items-center mt-1">
                <Mail className="h-4 w-4 mr-2" />
                {user.email || "No email"}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {(user.roles || []).map((role) => (
                  <span
                    key={role._id}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white bg-opacity-20 text-white border border-white border-opacity-30"
                  >
                    <Shield className="h-3 w-3 mr-1" />
                    {role.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-600">
                  Member since {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center">
                <Activity className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-600">
                  Last login:{" "}
                  {user.lastLogin
                    ? new Date(user.lastLogin).toLocaleDateString()
                    : "Never"}
                </span>
              </div>
            </div>
            <div className="flex items-center">
              {user.isActive ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Active
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  <XCircle className="h-3 w-3 mr-1" />
                  Inactive
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Information */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Profile Information
              </h2>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  aria-label="Edit profile"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </button>
              )}
            </div>

            <div className="p-6">
              {isEditing ? (
                <form
                  onSubmit={handleProfileSubmit(onProfileSubmit)}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Full Name
                      </label>
                      <input
                        id="name"
                        {...registerProfile("name", {
                          required: "Name is required",
                          minLength: {
                            value: 2,
                            message: "Name must be at least 2 characters",
                          },
                        })}
                        type="text"
                        className="block w-full border border-gray-300 rounded-md shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter your full name"
                        aria-invalid={profileErrors.name ? "true" : "false"}
                        aria-describedby={
                          profileErrors.name ? "name-error" : undefined
                        }
                      />
                      {profileErrors.name && (
                        <p
                          id="name-error"
                          className="mt-1 text-sm text-red-600"
                        >
                          {profileErrors.name.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="age"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Age
                      </label>
                      <input
                        id="age"
                        {...registerProfile("age", {
                          required: "Age is required",
                          min: {
                            value: 1,
                            message: "Age must be at least 1",
                          },
                          max: {
                            value: 120,
                            message: "Age must be less than 120",
                          },
                        })}
                        type="number"
                        className="block w-full border border-gray-300 rounded-md shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter your age"
                        aria-invalid={profileErrors.age ? "true" : "false"}
                        aria-describedby={
                          profileErrors.age ? "age-error" : undefined
                        }
                      />
                      {profileErrors.age && (
                        <p id="age-error" className="mt-1 text-sm text-red-600">
                          {profileErrors.age.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setValue("name", user.name || "");
                        setValue("age", user.age ? String(user.age) : "");
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      aria-label="Cancel profile edit"
                    >
                      <X className="h-4 w-4 mr-2 inline" />
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={updateProfileMutation.isLoading}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                      aria-label="Save profile changes"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {updateProfileMutation.isLoading
                        ? "Saving..."
                        : "Save Changes"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Full Name
                      </h3>
                      <p className="mt-1 text-lg text-gray-900">
                        {user.name || "Not provided"}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Age</h3>
                      <p className="mt-1 text-lg text-gray-900">
                        {user.age ? `${user.age} years old` : "Not provided"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Email Address
                      </h3>
                      <p className="mt-1 text-lg text-gray-900">
                        {user.email || "Not provided"}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Account Status
                      </h3>
                      <div className="mt-1">
                        {user.isActive ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Active Account
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                            <XCircle className="h-4 w-4 mr-2" />
                            Inactive Account
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Change Password */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900 flex items-center">
                <Lock className="h-5 w-5 mr-2" />
                Password & Security
              </h2>
              {!isChangingPassword && (
                <button
                  onClick={() => setIsChangingPassword(true)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  aria-label="Change password"
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Change Password
                </button>
              )}
            </div>

            <div className="p-6">
              {isChangingPassword ? (
                <form
                  onSubmit={handlePasswordSubmit(onPasswordSubmit)}
                  className="space-y-6"
                >
                  <div>
                    <label
                      htmlFor="currentPassword"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        id="currentPassword"
                        {...registerPassword("currentPassword", {
                          required: "Current password is required",
                        })}
                        type={showCurrentPassword ? "text" : "password"}
                        className="block w-full border border-gray-300 rounded-md shadow-sm py-3 px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter your current password"
                        aria-invalid={
                          passwordErrors.currentPassword ? "true" : "false"
                        }
                        aria-describedby={
                          passwordErrors.currentPassword
                            ? "currentPassword-error"
                            : undefined
                        }
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                        aria-label={
                          showCurrentPassword
                            ? "Hide current password"
                            : "Show current password"
                        }
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {passwordErrors.currentPassword && (
                      <p
                        id="currentPassword-error"
                        className="mt-1 text-sm text-red-600"
                      >
                        {passwordErrors.currentPassword.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="newPassword"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        id="newPassword"
                        {...registerPassword("newPassword", {
                          required: "New password is required",
                          minLength: {
                            value: 6,
                            message: "Password must be at least 6 characters",
                          },
                        })}
                        type={showNewPassword ? "text" : "password"}
                        className="block w-full border border-gray-300 rounded-md shadow-sm py-3 px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter your new password"
                        aria-invalid={
                          passwordErrors.newPassword ? "true" : "false"
                        }
                        aria-describedby={
                          passwordErrors.newPassword
                            ? "newPassword-error"
                            : undefined
                        }
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        aria-label={
                          showNewPassword
                            ? "Hide new password"
                            : "Show new password"
                        }
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {passwordErrors.newPassword && (
                      <p
                        id="newPassword-error"
                        className="mt-1 text-sm text-red-600"
                      >
                        {passwordErrors.newPassword.message}
                      </p>
                    )}

                    {/* Password strength indicator */}
                    {newPassword && (
                      <div className="mt-2">
                        <div className="text-xs text-gray-500 mb-1">
                          Password strength:
                        </div>
                        <div className="flex space-x-1">
                          <div
                            className={`h-1 w-1/4 rounded ${
                              newPassword.length >= 6
                                ? "bg-green-400"
                                : "bg-gray-200"
                            }`}
                          ></div>
                          <div
                            className={`h-1 w-1/4 rounded ${
                              newPassword.length >= 8 &&
                              /[A-Z]/.test(newPassword)
                                ? "bg-green-400"
                                : "bg-gray-200"
                            }`}
                          ></div>
                          <div
                            className={`h-1 w-1/4 rounded ${
                              newPassword.length >= 8 &&
                              /[0-9]/.test(newPassword)
                                ? "bg-green-400"
                                : "bg-gray-200"
                            }`}
                          ></div>
                          <div
                            className={`h-1 w-1/4 rounded ${
                              newPassword.length >= 8 &&
                              /[^A-Za-z0-9]/.test(newPassword)
                                ? "bg-green-400"
                                : "bg-gray-200"
                            }`}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        {...registerPassword("confirmPassword", {
                          required: "Please confirm your new password",
                          validate: (value) =>
                            value === newPassword || "Passwords do not match",
                        })}
                        type={showNewPassword ? "text" : "password"}
                        className="block w-full border border-gray-300 rounded-md shadow-sm py-3 px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Confirm your new password"
                        aria-invalid={
                          passwordErrors.confirmPassword ? "true" : "false"
                        }
                        aria-describedby={
                          passwordErrors.confirmPassword
                            ? "confirmPassword-error"
                            : undefined
                        }
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        aria-label={
                          showNewPassword
                            ? "Hide confirm password"
                            : "Show confirm password"
                        }
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {passwordErrors.confirmPassword && (
                      <p
                        id="confirmPassword-error"
                        className="mt-1 text-sm text-red-600"
                      >
                        {passwordErrors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                    <h4 className="text-sm font-medium text-blue-800 mb-2">
                      Password Requirements:
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li className="flex items-center">
                        <CheckCircle
                          className={`h-3 w-3 mr-2 ${
                            newPassword?.length >= 6
                              ? "text-green-500"
                              : "text-gray-400"
                          }`}
                        />
                        At least 6 characters
                      </li>
                      <li className="flex items-center">
                        <CheckCircle
                          className={`h-3 w-3 mr-2 ${
                            newPassword?.length >= 8 &&
                            /[A-Z]/.test(newPassword)
                              ? "text-green-500"
                              : "text-gray-400"
                          }`}
                        />
                        One uppercase letter
                      </li>
                      <li className="flex items-center">
                        <CheckCircle
                          className={`h-3 w-3 mr-2 ${
                            newPassword?.length >= 8 &&
                            /[0-9]/.test(newPassword)
                              ? "text-green-500"
                              : "text-gray-400"
                          }`}
                        />
                        One number
                      </li>
                      <li className="flex items-center">
                        <CheckCircle
                          className={`h-3 w-3 mr-2 ${
                            newPassword?.length >= 8 &&
                            /[^A-Za-z0-9]/.test(newPassword)
                              ? "text-green-500"
                              : "text-gray-400"
                          }`}
                        />
                        One special character
                      </li>
                    </ul>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => {
                        setIsChangingPassword(false);
                        resetPassword();
                        setShowCurrentPassword(false);
                        setShowNewPassword(false);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      aria-label="Cancel password change"
                    >
                      <X className="h-4 w-4 mr-2 inline" />
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={changePasswordMutation.isLoading}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                      aria-label="Change password"
                    >
                      <Lock className="h-4 w-4 mr-2" />
                      {changePasswordMutation.isLoading
                        ? "Changing..."
                        : "Change Password"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Keep your account secure by using a strong password and
                    changing it regularly.
                  </p>
                  <div className="bg-gray-50 rounded-md p-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                      Security Tips:
                    </h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>
                        • Use a unique password that you don't use anywhere else
                      </li>
                      <li>
                        • Include a mix of letters, numbers, and special
                        characters
                      </li>
                      <li>
                        • Avoid using personal information in your password
                      </li>
                      <li>• Consider using a password manager</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Account Statistics */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Account Overview
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <Shield className="h-5 w-5 text-blue-500 mr-3" />
                    <span className="text-sm font-medium text-blue-900">
                      Total Permissions
                    </span>
                  </div>
                  <span className="text-lg font-bold text-blue-600">
                    {(user.permissions || []).length}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-sm font-medium text-green-900">
                      Assigned Roles
                    </span>
                  </div>
                  <span className="text-lg font-bold text-green-600">
                    {(user.roles || []).length}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-purple-500 mr-3" />
                    <span className="text-sm font-medium text-purple-900">
                      Member For
                    </span>
                  </div>
                  <span className="text-lg font-bold text-purple-600">
                    {Math.floor(
                      (new Date() - new Date(user.createdAt)) /
                        (1000 * 60 * 60 * 24)
                    )}{" "}
                    days
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* User Roles */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Your Roles</h3>
            </div>
            <div className="p-6">
              {user.roles && user.roles.length > 0 ? (
                <div className="space-y-3">
                  {user.roles.map((role) => (
                    <div
                      key={role._id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900 flex items-center">
                          <Shield className="h-4 w-4 mr-2" />
                          {role.name}
                        </h4>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(
                            role.name
                          )}`}
                        >
                          {role.name}
                        </span>
                      </div>
                      {role.description && (
                        <p className="text-sm text-gray-600 mb-2">
                          {role.description}
                        </p>
                      )}
                      {role.permissions && role.permissions.length > 0 && (
                        <div className="text-xs text-gray-500">
                          {role.permissions.length} permission
                          {role.permissions.length !== 1 ? "s" : ""} included
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Shield className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No roles assigned</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* User Permissions - Full Width */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Your Permissions
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            These permissions determine what actions you can perform in the
            system
          </p>
        </div>
        <div className="p-6">
          {user.permissions && user.permissions.length > 0 ? (
            <div className="space-y-6">
              {Object.entries(groupedPermissions).map(
                ([resource, permissions]) => (
                  <div key={resource}>
                    <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3 flex items-center">
                      <div
                        className={`w-3 h-3 rounded-full mr-2 ${
                          resource === "user"
                            ? "bg-blue-400"
                            : resource === "post"
                            ? "bg-green-400"
                            : resource === "role"
                            ? "bg-purple-400"
                            : "bg-red-400"
                        }`}
                      ></div>
                      {resource} Permissions
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                      {permissions.map((permission) => {
                        const parts = permission.split(".");
                        const action = parts[1];
                        const condition = parts[2];

                        return (
                          <div
                            key={permission}
                            className={`p-3 rounded-lg border-2 ${getPermissionColor(
                              permission
                            )}`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-sm font-medium">
                                  {action}
                                  {condition && (
                                    <span className="text-xs opacity-75 ml-1">
                                      ({condition})
                                    </span>
                                  )}
                                </span>
                              </div>
                              <CheckCircle className="h-4 w-4 text-current" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                No Permissions Assigned
              </h4>
              <p className="text-sm text-gray-500 mb-4">
                Contact your administrator to request access permissions.
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 max-w-md mx-auto">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Limited Access
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>
                        You currently have no permissions assigned to your
                        account. This means you have read-only access to public
                        content.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
