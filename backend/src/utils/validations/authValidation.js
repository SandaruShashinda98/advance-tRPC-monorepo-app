import { z } from "zod";

export const authValidation = {
  registerValidation: () =>
    z.object({
      name: z.string().min(1, "Name is required"),
      email: z.string().email("Invalid email format"),
      password: z.string().min(6, "Password must be at least 6 characters"),
      age: z
        .number()
        .min(1, "Age must be at least 1")
        .max(120, "Age must be less than 120"),
    }),

  loginValidation: () =>
    z.object({
      email: z.string().email("Invalid email format"),
      password: z.string().min(1, "Password is required"),
    }),

  changePasswordValidation: () =>
    z.object({
      currentPassword: z.string().min(1, "Current password is required"),
      newPassword: z
        .string()
        .min(6, "New password must be at least 6 characters"),
    }),
};
