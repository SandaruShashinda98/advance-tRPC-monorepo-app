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
    .input(z.object(postValidation.createPostValidation(z)))
    .mutation(async ({ input, ctx }) => {
      const result = await postService.createPost(input, ctx);
      return result;
    }),

  // Get all posts (public endpoint, but shows more info to authenticated users)
  getAll: publicProcedure
    .input(z.object(postValidation.getAllPostsFilters(z)))
    .query(async ({ input, ctx }) => {
      const result = await postService.getAllPosts(input, ctx);
      return result;
    }),

  // Get post by ID (public for published posts, requires permission for others)
  getById: publicProcedure
    .input(z.object(postValidation.getPostByIdFilters(z)))
    .query(async ({ input, ctx }) => {
      const result = await postService.getPostById(input, ctx);
      return result;
    }),

  // Get user's own posts
  getMyPosts: protectedProcedure
    .input(z.object(postValidation.getPostFilters(z)))
    .query(async ({ input, ctx }) => {
      const result = await postService.getOwnPosts(input, ctx);
      return result;
    }),

  // Update post (requires post.update permission or own post with post.update.own)
  update: protectedProcedure
    .input(z.object(postValidation.updatePostValidation(z)))
    .mutation(async ({ input, ctx }) => {
      const result = await postService.updatePost(input, ctx);
      return result;
    }),

  // Delete post (requires post.delete permission or own post with post.delete.own)
  delete: protectedProcedure
    .input(z.object(postValidation.deletePostValidation(z)))
    .mutation(async ({ input, ctx }) => {
      const result = await postService.deletePost(input, ctx);
      return result;
    }),

  // Moderate post (requires post.moderate permission)
  moderate: createPermissionProcedure(PERMISSIONS.POST_MODERATE)
    .input(z.object(postValidation.createPostPermissionValidation(z)))
    .mutation(async ({ input }) => {
      const result = await postService.moderatePost(input);
      return result;
    }),
});
