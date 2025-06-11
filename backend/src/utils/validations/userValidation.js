import { z } from "zod";
import { PERMISSIONS } from "../permissions.js";

export const userValidation = {
  IDValidation: () =>
    z.object({
      id: z.string(),
    }),

  userRoleValidation: () =>
    z.object({
      userId: z.string(),
      roleId: z.string(),
    }),

  userPermissionValidation: () =>
    z.object({
      userId: z.string(),
      permission: z.enum(Object.values(PERMISSIONS)),
    }),

  updateUser: () =>
    z.object({
      id: z.string(),
      name: z.string().min(1).optional(),
      email: z.string().email().optional(),
      age: z.number().min(1).max(120).optional(),
      isActive: z.boolean().optional(),
    }),
};
