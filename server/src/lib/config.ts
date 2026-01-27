// env.ts
import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().min(1),
  DATABASE_URL: z.string().min(1),

  //   Better Auth
  BETTER_AUTH_SECRET: z.string().min(1),

  BETTER_AUTH_URL: z.string().min(1),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("debug"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  // coudinary
  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),
  CLOUDINARY_URL: z.string().min(1),

  //RESEND
  RESEND_API_KEY: z.string().min(1),

  //client
  CLIENT_URL: z.string().min(1),
});

const env = envSchema.parse(process.env);

export default env;
