# Example: Using @sentinel/core-engine

This example demonstrates how to use the `@sentinel/core-engine` package in a real-world Node.js application.

## Installation

```bash
npm install @sentinel/core-engine express
# or
pnpm add @sentinel/core-engine express
```

## Quick Start

Run the example:

```bash
npm install
npm start
```

Then test the rate limiter:

```bash
# Make multiple requests
for i in {1..15}; do curl http://localhost:3000/api/data; echo ""; done
```

## What's Included

- **Express API** with rate limiting middleware
- **SmartRateLimiter** protecting endpoints
- **GeneGuard** security scanner integration
- **TypeScript** examples with full type safety

## Learn More

See the [main documentation](https://github.com/amir1824/sentinel-devex) for more details.
