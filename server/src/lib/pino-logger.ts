import pino from "pino";
import pretty from "pino-pretty";
import { pinoLogger } from "hono-pino";

import env from "./config";

export const pinoInstance = pino(
  {
    level: env.LOG_LEVEL || "info",
    redact: [
      "req.headers.authorization",
      "req.headers.cookie",
      "password",
      "token",
    ],
  },
  env.NODE_ENV === "production"
    ? undefined
    : pretty({
        colorize: true,
        translateTime: "HH:MM:ss",
      }),
);

export const logger = pinoLogger({
  pino: pinoInstance,
  http: {
    reqId: () => Bun.randomUUIDv7(),
  },
});
