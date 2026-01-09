import { describe, it, expect, beforeEach } from 'vitest';

import { SmartRateLimiter } from './SmartRateLimiter';

describe('SmartRateLimiter', () => {
  let limiter: SmartRateLimiter<string>;

  beforeEach(() => {
    limiter = new SmartRateLimiter({
      windowMs: 1000,
      limit: 3,
      punishmentMs: 500
    });
  });

  it('should allow requests within limit', () => {
    const result1 = limiter.check('user1');
    expect(result1.allowed).toBe(true);
    expect(result1.remaining).toBe(2);

    const result2 = limiter.check('user1');
    expect(result2.allowed).toBe(true);
    expect(result2.remaining).toBe(1);

    const result3 = limiter.check('user1');
    expect(result3.allowed).toBe(true);
    expect(result3.remaining).toBe(0);
  });

  it('should block requests exceeding limit', () => {
    limiter.check('user1');
    limiter.check('user1');
    limiter.check('user1');

    const result = limiter.check('user1');
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('should track different users independently', () => {
    limiter.check('user1');
    limiter.check('user1');
    limiter.check('user1');

    const user1Result = limiter.check('user1');
    expect(user1Result.allowed).toBe(false);

    const user2Result = limiter.check('user2');
    expect(user2Result.allowed).toBe(true);
    expect(user2Result.remaining).toBe(2);
  });

  it('should return correct resetAt time', () => {
    const beforeCheck = Date.now();
    const result = limiter.check('user1');
    const afterCheck = Date.now();

    expect(result.resetAt.getTime()).toBeGreaterThanOrEqual(beforeCheck + 1000);
    expect(result.resetAt.getTime()).toBeLessThanOrEqual(afterCheck + 1000 + 10);
  });

  it('should return correct totalRequests count', () => {
    const result1 = limiter.check('user1');
    expect(result1.totalRequests).toBe(1);

    const result2 = limiter.check('user1');
    expect(result2.totalRequests).toBe(2);

    const result3 = limiter.check('user1');
    expect(result3.totalRequests).toBe(3);
  });
});
