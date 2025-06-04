export const postValidation = {
  createPostValidation: (z) => ({
    title: z.string().min(1, "Title is required"),
    content: z.string().min(1, "Content is required"),
    status: z.enum(["draft", "published", "archived"]).default("published"),
    tags: z.array(z.string()).optional(),
    isPublic: z.boolean().default(true),
    authorId: z.string().optional(),
  }),

  updatePostValidation: (z) => ({
    id: z.string(),
    title: z.string().min(1).optional(),
    content: z.string().min(1).optional(),
    status: z.enum(["draft", "published", "archived"]).optional(),
    tags: z.array(z.string()).optional(),
    isPublic: z.boolean().optional(),
  }),

  deletePostValidation: (z) => ({
    id: z.string(),
  }),

  createPostPermissionValidation: (z) => ({
    id: z.string(),
    action: z.enum(["approve", "reject", "archive"]),
    reason: z.string().optional(),
  }),

  getPostFilters: (z) => ({
    status: z.enum(["draft", "published", "archived"]).optional(),
    limit: z.number().min(1).max(100).default(20),
    offset: z.number().min(0).default(0),
  }),

  getAllPostsFilters: (z) => ({
    status: z.enum(["draft", "published", "archived"]).optional(),
    authorId: z.string().optional(),
    limit: z.number().min(1).max(100).default(20),
    offset: z.number().min(0).default(0),
  }),

  getPostByIdFilters: (z) => ({
    id: z.string(),
  }),
};
