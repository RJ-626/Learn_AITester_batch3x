import { getLocalTimezone, getNextLocalNineAm } from "./time";
import type { SchedulerStatus } from "./types";

export function startScheduler(): void {
  // Scheduler is disabled on Vercel because serverless functions do not support
  // persistent background processes. Use the "Run Pipeline Now" button on the
  // dashboard, or configure a Vercel Cron Job (Pro plan) to hit /api/run.
}

export function getSchedulerStatus(): SchedulerStatus {
  return {
    initialized: false,
    cronExpression: "0 9 * * *",
    timezone: getLocalTimezone(),
    nextRunAt: getNextLocalNineAm()
  };
}
