import { Redis } from "@upstash/redis";
import { requireEnv } from "./env";

export const redis = new Redis({
  url: requireEnv("UPSTASH_REDIS_REST_URL"),
  token: requireEnv("UPSTASH_REDIS_REST_TOKEN")
});
