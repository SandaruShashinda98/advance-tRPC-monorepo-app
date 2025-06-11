import { z } from "zod";
import { PERMISSIONS } from "../permissions.js";

export const roleValidation = {
  createRoleValidation: () =>
    z.object({
      name: z.string().min(1, "Name is required"),
      description: z.string().optional(),
      permissions: z.array(z.enum(Object.values(PERMISSIONS))).optional(),
    }),

  updateRoleValidation: () =>
    z.object({
      id: z.string(),
      name: z.string().min(1).optional(),
      description: z.string().optional(),
      isActive: z.boolean().optional(),
    }),

  IDValidation: () =>
    z.object({
      id: z.string(),
    }),

  rolePermissionValidation: () =>
    z.object({
      roleId: z.string(),
      permission: z.enum(Object.values(PERMISSIONS)),
    }),
};
