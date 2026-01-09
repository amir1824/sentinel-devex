export interface Metric {
  name: string;
  value: number;
}

export function formatMetric(m: Metric): string {
  return `${m.name}: ${m.value}`;
}

export const version = "0.1.0";

// SmartRateLimiter
export { SmartRateLimiter } from './devEx/SmartRateLimiter';
export type { LimiterConfig, RateLimitResult } from './devEx/SmartRateLimiter';
