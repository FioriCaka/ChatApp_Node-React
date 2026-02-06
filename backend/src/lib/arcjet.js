import { ENV } from "./env.js";
import arcjet, { detectBot, shield, slidingWindow } from "@arcjet/node";

const arcjetMode = ["LIVE", "DRY_RUN"].includes(ENV.ARCJET_ENV)
  ? ENV.ARCJET_ENV
  : "DRY_RUN";
const hasArcjetConfig = Boolean(ENV.ARCJET_KEY);

const aj = hasArcjetConfig
  ? arcjet({
      key: ENV.ARCJET_KEY,
      rules: [
        shield({ mode: arcjetMode }),
        detectBot({
          mode: arcjetMode,
          allow: ["CATEGORY:SEARCH_ENGINE"],
        }),
        // Create a token bucket rate limit. Other algorithms are supported.
        slidingWindow({
          mode: arcjetMode,
          max: 100,
          interval: 60,
        }),
      ],
    })
  : {
      protect: async () => ({
        isDenied: () => false,
        reason: {},
        results: [],
      }),
    };

export { aj };
