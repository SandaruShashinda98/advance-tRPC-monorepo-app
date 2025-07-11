import { TRPCError } from "@trpc/server";
import { User } from "../models/User.js";
import { Post } from "../models/Post.js";
import { PermissionService } from "./permissionService.js";
import { PERMISSIONS } from "../utils/permissions.js";
import { generateToken } from "../utils/jwt.js";

const permissionService = new PermissionService();

export class AuthService {
  async registerUser(input, ctx) {
    try {
      const existingUser = await User.findOne({ email: input.email });
      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User with this email already exists",
        });
      }

      // Get default user role
      const userRole = await Role.findOne({ name: "user" });
      if (!userRole) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Default user role not found",
        });
      }

      const user = new User({
        ...input,
        roles: [userRole._id],
      });
      await user.save();

      const token = generateToken(user._id);

      ctx.res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return {
        user: user.toJSON(),
        token,
      };
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to register user",
      });
    }
  }

  async login(input, ctx) {
    try {
      const user = await User.findOne({ email: input.email }).select(
        "+password"
      );
      if (!user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid email or password",
        });
      }

      if (!user.isActive) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Account is deactivated",
        });
      }

      const isPasswordValid = await user.comparePassword(input.password);
      if (!isPasswordValid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid email or password",
        });
      }

      const token = generateToken(user._id);

      ctx.res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return {
        user: user.toJSON(),
        token,
      };
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to login",
      });
    }
  }

  async changePassword(input, ctx) {
    try {
      const user = await User.findById(ctx.user._id).select("+password");

      const isCurrentPasswordValid = await user.comparePassword(
        input.currentPassword
      );
      if (!isCurrentPasswordValid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Current password is incorrect",
        });
      }

      user.password = input.newPassword;
      await user.save();

      return { message: "Password changed successfully" };
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to change password",
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
