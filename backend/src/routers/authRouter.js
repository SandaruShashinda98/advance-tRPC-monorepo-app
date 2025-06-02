import { router, publicProcedure, protectedProcedure, z } from '../trpc.js';
import { User } from '../models/User.js';
import { Role } from '../models/Role.js';
import { generateToken } from '../utils/jwt.js';
import { TRPCError } from '@trpc/server';

export const authRouter = router({
  register: publicProcedure
    .input(z.object({
      name: z.string().min(1, 'Name is required'),
      email: z.string().email('Invalid email format'),
      password: z.string().min(6, 'Password must be at least 6 characters'),
      age: z.number().min(1, 'Age must be at least 1').max(120, 'Age must be less than 120')
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const existingUser = await User.findOne({ email: input.email });
        if (existingUser) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'User with this email already exists'
          });
        }

        // Get default user role
        const userRole = await Role.findOne({ name: 'user' });
        if (!userRole) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Default user role not found'
          });
        }

        const user = new User({
          ...input,
          roles: [userRole._id]
        });
        await user.save();

        const token = generateToken(user._id);

        ctx.res.cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return {
          user: user.toJSON(),
          token
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to register user'
        });
      }
    }),

  login: publicProcedure
    .input(z.object({
      email: z.string().email('Invalid email format'),
      password: z.string().min(1, 'Password is required')
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const user = await User.findOne({ email: input.email }).select('+password');
        if (!user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Invalid email or password'
          });
        }

        if (!user.isActive) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Account is deactivated'
          });
        }

        const isPasswordValid = await user.comparePassword(input.password);
        if (!isPasswordValid) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Invalid email or password'
          });
        }

        const token = generateToken(user._id);

        ctx.res.cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return {
          user: user.toJSON(),
          token
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to login'
        });
      }
    }),

  logout: protectedProcedure
    .mutation(async ({ ctx }) => {
      ctx.res.clearCookie('token');
      return { message: 'Logged out successfully' };
    }),

  me: protectedProcedure
    .query(async ({ ctx }) => {
      const permissions = await ctx.user.getAllPermissions();
      return {
        ...ctx.user.toJSON(),
        permissions
      };
    }),

  changePassword: protectedProcedure
    .input(z.object({
      currentPassword: z.string().min(1, 'Current password is required'),
      newPassword: z.string().min(6, 'New password must be at least 6 characters')
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const user = await User.findById(ctx.user._id).select('+password');
        
        const isCurrentPasswordValid = await user.comparePassword(input.currentPassword);
        if (!isCurrentPasswordValid) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Current password is incorrect'
          });
        }

        user.password = input.newPassword;
        await user.save();

        return { message: 'Password changed successfully' };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to change password'
        });
      }
    })
});