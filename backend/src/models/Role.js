import mongoose from "mongoose";
import { PERMISSIONS } from "../utils/permissions.js";

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    permissions: [
      {
        type: String,
        enum: Object.values(PERMISSIONS),
        required: true,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    isSystem: {
      type: Boolean,
      default: false, // System roles cannot be deleted
    },
  },
  {
    timestamps: true,
  }
);

export const Role = mongoose.model("Role", roleSchema);
