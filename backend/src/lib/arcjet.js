import { ENV } from "./env.js";
import arcjet, { detectBot, shield, slidingWindow } from "@arcjet/node";

const aj = arcjet({
  key: ENV.ARCJET_KEY,
  rules: [
    shield({ mode: ENV.ARCJET_ENV }),
    detectBot({
      mode: ENV.ARCJET_ENV,
      allow: ["CATEGORY:SEARCH_ENGINE"],
    }),
    // Create a token bucket rate limit. Other algorithms are supported.
    slidingWindow({
      mode: ENV.ARCJET_ENV,
      max: 100,
      interval: 60,
    }),
  ],
});

export { aj };
