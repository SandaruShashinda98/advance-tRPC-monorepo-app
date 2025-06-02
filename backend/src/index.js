import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { connectDB } from "./db.js";
import { createContext } from "./context.js";
import { router } from "./trpc.js";
import { authRouter } from "./routers/authRouter.js";
import { userRouter } from "./routers/userRouter.js";
import { postRouter } from "./routers/postRouter.js";
import { roleRouter } from "./routers/roleRouter.js";
import { PERMISSIONS, PERMISSION_GROUPS } from "./utils/permissions.js";

// Create the main tRPC router
const appRouter = router({
  auth: authRouter,
  user: userRouter,
  post: postRouter,
  role: roleRouter,
});

const app = express();
const PORT = process.env.PORT || 3001;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// tRPC middleware
app.use(
  "/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    message: "tRPC Server with Enum-Based Permission Authorization is running!",
    timestamp: new Date().toISOString(),
  });
});

// API info endpoint
app.get("/api/info", (req, res) => {
  res.json({
    name: "tRPC Enum-Based Permission API",
    version: "1.0.0",
    features: [
      "JWT Authentication",
      "Enum-Based Permission Authorization",
      "Role Management",
      "User Management",
      "Post Management",
      "Fine-grained Access Control",
    ],
    endpoints: {
      auth: ["register", "login", "logout", "me", "changePassword"],
      user: [
        "getAll",
        "getById",
        "update",
        "delete",
        "assignRole",
        "removeRole",
        "assignPermission",
        "removePermission",
        "getUserPermissions",
      ],
      post: [
        "create",
        "getAll",
        "getById",
        "getMyPosts",
        "update",
        "delete",
        "moderate",
      ],
      role: [
        "getAll",
        "getById",
        "create",
        "update",
        "delete",
        "addPermission",
        "removePermission",
        "getAvailablePermissions",
      ],
    },
    permissions: {
      available: Object.values(PERMISSIONS),
      groups: PERMISSION_GROUPS,
    },
  });
});

// Permissions endpoint
app.get("/api/permissions", (req, res) => {
  res.json({
    permissions: PERMISSIONS,
    groups: PERMISSION_GROUPS,
    total: Object.keys(PERMISSIONS).length,
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📚 API info available at http://localhost:${PORT}/api/info`);
  console.log(
    `🔐 Permissions list at http://localhost:${PORT}/api/permissions`
  );
  console.log(`🌐 tRPC endpoint: http://localhost:${PORT}/trpc`);
  console.log(
    `🎯 Run 'npm run seed' to populate the database with initial data`
  );
});
