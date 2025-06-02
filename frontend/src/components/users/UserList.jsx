import { trpc } from "../../utils/trpc";

const UserList = () => {
  const {
    data: users,
    isLoading,
    error,
    refetch,
  } = trpc.user.getAll.useQuery();
  const deleteUserMutation = trpc.user.delete.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleDeleteUser = async (userId) => {
    try {
      await deleteUserMutation.mutateAsync({ id: userId });
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
        <p className="text-red-800">Error loading users: {error.message}</p>
        <button
          onClick={() => refetch()}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Users</h2>
        <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded">
          {users?.length || 0} users
        </span>
      </div>

      {!users || users.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">👥</div>
          <h3 className="text-lg font-medium text-gray-600 mb-2">
            No users found
          </h3>
          <p className="text-gray-500">
            Get started by adding your first user.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {users.map((user) => (
            <div
              key={user._id}
              className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">
                    {user.name}
                  </h3>
                  <p className="text-gray-600 text-sm break-all">
                    {user.email}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteUser(user._id)}
                  disabled={deleteUserMutation.isLoading}
                  className="ml-2 p-2 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                  title="Delete user"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>

              <div className="text-xs text-gray-500">
                Joined: {new Date(user.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserList;
