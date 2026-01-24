import { cors } from "hono/cors";
import env from "../lib/config";

export const CorsMiddleware = cors({
  origin: env.CLIENT_URL.split(",").map((url) => url.trim()),
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["POST", "GET", "OPTIONS", "PATCH", "DELETE", "PUT"],
  exposeHeaders: ["Content-Length"],
  maxAge: 600,
  credentials: true,
});
