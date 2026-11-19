import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "../db/prisma";
import { env } from "../env";

const trustedOrigins = [env.NEXT_PUBLIC_APP_URL];
if (env.NEXT_PUBLIC_APP_URL.startsWith("http://localhost") || env.NEXT_PUBLIC_APP_URL.startsWith("http://127.0.0.1")) {
  trustedOrigins.push("http://localhost:*", "http://127.0.0.1:*");
}

export const auth = betterAuth({
  secret: env.AUTH_SECRET,
  baseURL: env.NEXT_PUBLIC_APP_URL,
  trustedOrigins,
  database: prismaAdapter(prisma, {
    provider: "mysql",
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
});
