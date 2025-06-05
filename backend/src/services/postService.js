import { TRPCError } from "@trpc/server";
import { User } from "../models/User.js";
import { Post } from "../models/Post.js";
import { PermissionService } from "./permissionService.js";
import { PERMISSIONS } from "../utils/permissions.js";


const permissionService = new PermissionService()

export class PostService {
  async createPost(input, ctx) {
    try {
      const authorId = input.authorId || ctx.user._id;

      // Check if user can create posts for others
      if (authorId !== ctx.user._id.toString()) {
        const canManagePosts = await permissionService.checkPermission(
          ctx.user._id,
          PERMISSIONS.POST_MANAGE
        );

        if (!canManagePosts) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You can only create posts for yourself",
          });
        }
      }

      // Verify author exists and is active
      const author = await User.findById(authorId);
      if (!author || !author.isActive) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid or inactive author",
        });
      }

      const post = new Post({
        title: input.title,
        content: input.content,
        status: input.status,
        tags: input.tags || [],
        isPublic: input.isPublic,
        author: authorId,
      });

      await post.save();
      await post.populate("author", "name email");
      return post;
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create post",
      });
    }
  }

  async getAllPosts(input, ctx) {
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
        .limit(input.limit || 20)
        .skip(input.offset || 0);

      const total = await Post.countDocuments(filter);

      const result = {
        posts,
        total,
        hasMore: (input.offset || 0) + (input.limit || 20) < total,
      };

      return result;
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch posts",
        cause: error,
      });
    }
  }

  async getPostById(input, ctx) {
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

        const hasPermission = await permissionService.checkPermission(
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
  }

  async getOwnPosts(input, ctx) {
    try {
      const filter = { author: ctx.user._id };

      if (input.status) {
        filter.status = input.status;
      }

      const posts = await Post.find(filter)
        .populate("author", "name email")
        .sort({ createdAt: -1 })
        .limit(input.limit || 20)
        .skip(input.offset || 0);

      const total = await Post.countDocuments(filter);

      return {
        posts,
        total,
        hasMore: (input.offset || 0) + (input.limit || 20) < total,
      };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch your posts",
      });
    }
  }

  async updatePost(input, ctx) {
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
        hasPermission = await permissionService.checkPermission(
          ctx.user._id,
          PERMISSIONS.POST_UPDATE_OWN,
          { ownerId: post.author }
        );
      } else {
        hasPermission = await permissionService.checkPermission(
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
  }

  async deletePost(input, ctx) {
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
        hasPermission = await permissionService.checkPermission(
          ctx.user._id,
          PERMISSIONS.POST_DELETE_OWN,
          { ownerId: post.author }
        );
      } else {
        hasPermission = await permissionService.checkPermission(
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
  }

  async moderatePost(input) {
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
  }
}
