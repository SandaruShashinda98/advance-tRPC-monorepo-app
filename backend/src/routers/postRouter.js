import {
  router,
  publicProcedure,
  protectedProcedure,
  createPermissionProcedure,
  z,
} from "../trpc.js";
import { PERMISSIONS } from "../utils/permissions.js";
import { PostService } from "../services/postService.js";
import { postValidation } from "../utils/validations/postValidation.js";

const postService = new PostService();

export const postRouter = router({
  // Create post (requires post.create permission)
  create: createPermissionProcedure(PERMISSIONS.POST_CREATE)
    .input(postValidation.createPostValidation())
    .mutation(async ({ input, ctx }) => {
      const result = await postService.createPost(input, ctx);
      return result;
    }),

  // Get all posts (public endpoint, but shows more info to authenticated users)
  getAll: publicProcedure
    .input(postValidation.getAllPostsFilters())
    .query(async ({ input, ctx }) => {
      const result = await postService.getAllPosts(input, ctx);
      return result;
    }),

  // Get post by ID (public for published posts, requires permission for others)
  getById: publicProcedure
    .input(postValidation.getPostByIdFilters())
    .query(async ({ input, ctx }) => {
      const result = await postService.getPostById(input, ctx);
      return result;
    }),

  // Get user's own posts
  getMyPosts: protectedProcedure
    .input(postValidation.getPostFilters())
    .query(async ({ input, ctx }) => {
      const result = await postService.getOwnPosts(input, ctx);
      return result;
    }),

  // Update post (requires post.update permission or own post with post.update.own)
  update: protectedProcedure
    .input(postValidation.updatePostValidation())
    .mutation(async ({ input, ctx }) => {
      const result = await postService.updatePost(input, ctx);
      return result;
    }),

  // Delete post (requires post.delete permission or own post with post.delete.own)
  delete: protectedProcedure
    .input(postValidation.deletePostValidation())
    .mutation(async ({ input, ctx }) => {
      const result = await postService.deletePost(input, ctx);
      return result;
    }),

  // Moderate post (requires post.moderate permission)
  moderate: createPermissionProcedure(PERMISSIONS.POST_MODERATE)
    .input(postValidation.createPostPermissionValidation())
    .mutation(async ({ input }) => {
      const result = await postService.moderatePost(input);
      return result;
    }),
});
