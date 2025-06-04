import { TRPCError } from "@trpc/server";
import { User } from "../models/User.js";
import { Post } from "../models/Post.js";
import { PermissionService } from "./permissionService.js";

export class PostService {
  async createPost(input, ctx) {
    try {
      const authorId = input.authorId || ctx.user._id;

      // Check if user can create posts for others
      if (authorId !== ctx.user._id.toString()) {
        const canManagePosts = await PermissionService.checkPermission(
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
}
