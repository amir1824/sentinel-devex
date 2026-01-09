# @sentinel/core-engine

[![npm version](https://img.shields.io/npm/v/@sentinel/core-engine.svg)](https://www.npmjs.com/package/@sentinel/core-engine)
[![npm downloads](https://img.shields.io/npm/dm/@sentinel/core-engine.svg)](https://www.npmjs.com/package/@sentinel/core-engine)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![CI](https://github.com/amir1824/sentinel-devex/workflows/CI/badge.svg)](https://github.com/amir1824/sentinel-devex/actions)

A comprehensive Developer Experience (DevEx) toolkit providing smart rate limiting, security scanning, and essential developer utilities for Node.js applications.

## Features

- **SmartRateLimiter** - Intelligent rate limiting with sliding windows and exponential backoff
- **GeneGuard** - Security scanner for detecting suspicious code patterns
- **TypeScript-first** - Full type safety with dual ESM/CJS builds
- **Zero dependencies** - Lightweight and secure

## Installation

```bash
npm install @sentinel/core-engine
```

Or using pnpm/yarn:

```bash
pnpm add @sentinel/core-engine
yarn add @sentinel/core-engine
```

## Usage

### SmartRateLimiter

Protect your APIs and services with intelligent rate limiting that includes automatic punishment escalation.

```typescript
import { SmartRateLimiter, type LimiterConfig } from '@sentinel/core-engine';

// Configure the rate limiter
const config: LimiterConfig = {
  windowMs: 60_000,      // 1 minute window
  limit: 10,             // max 10 requests per window
  punishmentMs: 5_000    // 5 second penalty on violation (doubles each time)
};

const limiter = new SmartRateLimiter<string>(config);

// Check if a request is allowed
const result = limiter.check('user-123');

if (result.allowed) {
  console.log(`Request allowed. ${result.remaining} requests remaining.`);
  // Process the request
} else {
  console.log(`Rate limited. Reset at ${result.resetAt}`);
  // Return 429 Too Many Requests
}
```

#### Features:
- **Sliding window** - Accurate rate limiting without burst allowance issues
- **Exponential backoff** - Automatic punishment escalation for repeat violators
- **Memory efficient** - Automatic cleanup of expired entries
- **Type-safe** - Generic key support for any identifier type

#### API:

**`check(key: K): RateLimitResult`**

Returns:
```typescript
interface RateLimitResult {
  allowed: boolean;       // Whether the request is allowed
  remaining: number;      // Requests remaining in current window
  resetAt: Date;          // When the limit resets
  totalRequests: number;  // Total requests in current window
}
```

---

### GeneGuard

Scan your codebase for suspicious patterns and potential security issues.

> ⚠️ **Node.js only** - This feature uses `fs` and `path` modules, not available in browser environments.

```typescript
import { GeneGuard } from '@sentinel/core-engine';

// Initialize scanner with root directory
const guard = new GeneGuard('./node_modules');

// Run the scan
const findings = guard.run();

// Review findings
findings.forEach(finding => {
  console.log(`⚠️  Found suspicious pattern in ${finding.filePath}`);
  console.log(`   Marker: ${finding.markerFound}`);
  console.log(`   Snippet: ${finding.snippet}`);
});
```

#### Default Detections:
- `eval(atob(` - Base64 obfuscation attempts
- `process.env["AWS_KEY"]` - Hardcoded credential patterns
- `child_process.exec(` - Arbitrary command execution

#### Use Cases:
- **Supply chain security** - Scan dependencies for malicious code
- **CI/CD integration** - Automated security checks in pipelines
- **Code review** - Quick security audits of JavaScript files

---

## Advanced Examples

### Express Middleware

```typescript
import express from 'express';
import { SmartRateLimiter } from '@sentinel/core-engine';

const app = express();
const limiter = new SmartRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100,
  punishmentMs: 60_000 // 1 minute penalty
});

app.use((req, res, next) => {
  const clientId = req.ip || 'unknown';
  const result = limiter.check(clientId);
  
  if (!result.allowed) {
    return res.status(429).json({
      error: 'Too many requests',
      resetAt: result.resetAt
    });
  }
  
  res.setHeader('X-RateLimit-Remaining', result.remaining.toString());
  res.setHeader('X-RateLimit-Reset', result.resetAt.toISOString());
  next();
});
```

### Per-User Rate Limiting

```typescript
const limiter = new SmartRateLimiter<number>({
  windowMs: 3600_000, // 1 hour
  limit: 1000,
  punishmentMs: 300_000 // 5 minutes
});

function handleRequest(userId: number) {
  const result = limiter.check(userId);
  return result;
}
```

---

## TypeScript Support

Full TypeScript support with comprehensive type definitions included.

```typescript
import type { 
  LimiterConfig, 
  RateLimitResult 
} from '@sentinel/core-engine';
```

---

## Browser vs Node.js

| Feature | Browser | Node.js |
|---------|---------|---------|
| SmartRateLimiter | ✅ | ✅ |
| GeneGuard | ❌ | ✅ |

**Note:** `GeneGuard` requires filesystem access and is only available in Node.js environments.

---

## Performance

- **Memory efficient** - Automatic cleanup prevents memory leaks
- **Fast lookups** - O(1) key lookup using Map
- **Non-blocking** - Cleanup runs in background intervals

---

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

Repository: [https://github.com/amir1824/sentinel-devex](https://github.com/amir1824/sentinel-devex)

---

## License

MIT License - see [LICENSE](./LICENSE) file for details.

---

## Support

- **Issues**: [GitHub Issues](https://github.com/amir1824/sentinel-devex/issues)
- **Discussions**: [GitHub Discussions](https://github.com/amir1824/sentinel-devex/discussions)

---

## Changelog

### 0.1.0 (Initial Release)

- ✨ SmartRateLimiter with exponential backoff
- 🔍 GeneGuard security scanner
- 📦 Dual ESM/CJS builds
- 🎯 Full TypeScript support
