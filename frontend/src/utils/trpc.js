import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";

export const trpc = createTRPCReact();

export const createTRPCClient = () => {
  return trpc.createClient({
    links: [
      httpBatchLink({
        url: "http://localhost:3001/trpc",
        credentials: "include",
        headers: () => {
          const token = document.cookie
            .split("; ")
            .find((row) => row.startsWith("token="))
            ?.split("=")[1];

          return token ? { authorization: `Bearer ${token}` } : {};
        },
      }),
    ],
  });
};
