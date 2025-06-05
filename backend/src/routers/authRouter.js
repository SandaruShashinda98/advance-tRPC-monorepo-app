import { router, publicProcedure, protectedProcedure } from "../trpc.js";
import { AuthService } from "../services/authService.js";
import { authValidation } from "../utils/validations/authValidation.js";

const authService = new AuthService();

export const authRouter = router({
  register: publicProcedure
    .input(authValidation.registerValidation())
    .mutation(async ({ input, ctx }) => {
      const result = await authService.registerUser(input, ctx);
      return result;
    }),

  login: publicProcedure
    .input(authValidation.loginValidation())
    .mutation(async ({ input, ctx }) => {
      const result = await authService.login(input, ctx);
      return result;
    }),

  logout: protectedProcedure.mutation(async ({ ctx }) => {
    ctx.res.clearCookie("token");
    return { message: "Logged out successfully" };
  }),

  me: protectedProcedure.query(async ({ ctx }) => {
    const permissions = await ctx.user.getAllPermissions();
    return {
      ...ctx.user.toJSON(),
      permissions,
    };
  }),

  changePassword: protectedProcedure
    .input(authValidation.changePasswordValidation())
    .mutation(async ({ input, ctx }) => {
      const result = await authService.changePassword(input, ctx);
      return result;
    }),
});
