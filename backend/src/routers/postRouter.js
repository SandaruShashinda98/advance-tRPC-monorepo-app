import {
  router,
  publicProcedure,
  protectedProcedure,
  createPermissionProcedure,
  z,
} from "../trpc.js";
import { Post } from "../models/Post.js";
import { User } from "../models/User.js";
import { PermissionService } from "../services/permissionService.js";
import { PERMISSIONS } from "../utils/permissions.js";
import { TRPCError } from "@trpc/server";
import { PostService } from "../services/postService.js";
import { postValidation } from "../utils/validations/postValidation.js";

export const postRouter = router({
  // Create post (requires post.create permission)
  create: createPermissionProcedure(PERMISSIONS.POST_CREATE)
    .input(z.object(postValidation.createPostValidation(z)))
    .mutation(async ({ input, ctx }) => {
      await PostService.createPost(input, ctx);
    }),

  // Get all posts (public endpoint, but shows more info to authenticated users)
  getAll: publicProcedure
    .input(z.object(postValidation.getAllPostsFilters(z)))
    .query(async ({ input, ctx }) => {
      try {
        const filter = { isPublic: true };

        // Only show published posts to non-authenticated users
        if (!ctx.user) {
          filter.status = "published";
        } else {
          // Authenticated users can filter by status
          if (input.status) {
            filter.status = input.status;
          }
        }

        if (input.authorId) {
          filter.author = input.authorId;
        }

        const posts = await Post.find(filter)
          .populate("author", ctx.user ? "name email" : "name")
          .sort({ createdAt: -1 })
          .limit(input.limit)
          .skip(input.offset);

        const total = await Post.countDocuments(filter);

        return {
          posts,
          total,
          hasMore: input.offset + input.limit < total,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch posts",
        });
      }
    }),

  // Get post by ID (public for published posts, requires permission for others)
  getById: publicProcedure
    .input(z.object(postValidation.getPostByIdFilters(z)))
    .query(async ({ input, ctx }) => {
      try {
        const post = await Post.findById(input.id).populate(
          "author",
          ctx.user ? "name email" : "name"
        );

        if (!post) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Post not found",
          });
        }

        // Check access permissions
        const isPublic = post.isPublic && post.status === "published";
        const isOwner =
          ctx.user && post.author._id.toString() === ctx.user._id.toString();

        if (!isPublic && !isOwner) {
          if (!ctx.user) {
            throw new TRPCError({
              code: "UNAUTHORIZED",
              message: "You must be logged in to view this post",
            });
          }

          const hasPermission = await PermissionService.checkPermission(
            ctx.user._id,
            PERMISSIONS.POST_READ
          );

          if (!hasPermission) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "You don't have permission to view this post",
            });
          }
        }

        return post;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch post",
        });
      }
    }),

  // Get user's own posts
  getMyPosts: protectedProcedure
    .input(z.object(postValidation.getPostFilters(z)))
    .query(async ({ input, ctx }) => {
      try {
        const filter = { author: ctx.user._id };

        if (input.status) {
          filter.status = input.status;
        }

        const posts = await Post.find(filter)
          .populate("author", "name email")
          .sort({ createdAt: -1 })
          .limit(input.limit)
          .skip(input.offset);

        const total = await Post.countDocuments(filter);

        return {
          posts,
          total,
          hasMore: input.offset + input.limit < total,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch your posts",
        });
      }
    }),

  // Update post (requires post.update permission or own post with post.update.own)
  update: protectedProcedure
    .input(z.object(postValidation.updatePostValidation(z)))
    .mutation(async ({ input, ctx }) => {
      try {
        const { id, ...updateData } = input;

        const post = await Post.findById(id);
        if (!post) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Post not found",
          });
        }

        const isOwner = post.author.toString() === ctx.user._id.toString();
        let hasPermission = false;

        if (isOwner) {
          hasPermission = await PermissionService.checkPermission(
            ctx.user._id,
            PERMISSIONS.POST_UPDATE_OWN,
            { ownerId: post.author }
          );
        } else {
          hasPermission = await PermissionService.checkPermission(
            ctx.user._id,
            PERMISSIONS.POST_UPDATE
          );
        }

        if (!hasPermission) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have permission to update this post",
          });
        }

        const updatedPost = await Post.findByIdAndUpdate(id, updateData, {
          new: true,
        }).populate("author", "name email");

        return updatedPost;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update post",
        });
      }
    }),

  // Delete post (requires post.delete permission or own post with post.delete.own)
  delete: protectedProcedure
    .input(z.object(postValidation.deletePostValidation(z)))
    .mutation(async ({ input, ctx }) => {
      try {
        const post = await Post.findById(input.id);
        if (!post) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Post not found",
          });
        }

        const isOwner = post.author.toString() === ctx.user._id.toString();
        let hasPermission = false;

        if (isOwner) {
          hasPermission = await PermissionService.checkPermission(
            ctx.user._id,
            PERMISSIONS.POST_DELETE_OWN,
            { ownerId: post.author }
          );
        } else {
          hasPermission = await PermissionService.checkPermission(
            ctx.user._id,
            PERMISSIONS.POST_DELETE
          );
        }

        if (!hasPermission) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have permission to delete this post",
          });
        }

        await Post.findByIdAndDelete(input.id);
        return { message: "Post deleted successfully" };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete post",
        });
      }
    }),

  // Moderate post (requires post.moderate permission)
  moderate: createPermissionProcedure(PERMISSIONS.POST_MODERATE)
    .input(z.object(postValidation.createPostPermissionValidation(z)))
    .mutation(async ({ input }) => {
      try {
        const post = await Post.findById(input.id);
        if (!post) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Post not found",
          });
        }

        let status;
        switch (input.action) {
          case "approve":
            status = "published";
            break;
          case "reject":
            status = "draft";
            break;
          case "archive":
            status = "archived";
            break;
        }

        const updatedPost = await Post.findByIdAndUpdate(
          input.id,
          { status },
          { new: true }
        ).populate("author", "name email");

        return {
          post: updatedPost,
          message: `Post ${input.action}ed successfully`,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to moderate post",
        });
      }
    }),
});
