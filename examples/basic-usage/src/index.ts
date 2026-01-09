import { SmartRateLimiter, GeneGuard, type LimiterConfig, type RateLimitResult } from '@sentinel/core-engine';
import express, { Request, Response, NextFunction } from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// 1. Rate Limiter Setup
// ==========================================

const rateLimiterConfig: LimiterConfig = {
  windowMs: 60_000,      // 1 minute window
  limit: 10,             // max 10 requests per minute
  punishmentMs: 5_000    // 5 second penalty on violation
};

const limiter = new SmartRateLimiter<string>(rateLimiterConfig);

// Rate limiting middleware
function rateLimitMiddleware(req: Request, res: Response, next: NextFunction) {
  const clientId = req.ip || 'unknown';
  const result: RateLimitResult = limiter.check(clientId);
  
  // Set rate limit headers
  res.setHeader('X-RateLimit-Limit', rateLimiterConfig.limit.toString());
  res.setHeader('X-RateLimit-Remaining', result.remaining.toString());
  res.setHeader('X-RateLimit-Reset', result.resetAt.toISOString());
  
  if (!result.allowed) {
    res.status(429).json({
      error: 'Too Many Requests',
      message: `Rate limit exceeded. Try again at ${result.resetAt.toISOString()}`,
      resetAt: result.resetAt,
      retryAfter: Math.ceil((result.resetAt.getTime() - Date.now()) / 1000)
    });
    return;
  }
  
  next();
}

// ==========================================
// 2. Routes
// ==========================================

app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Welcome to Sentinel DevEx Example API',
    endpoints: {
      '/api/data': 'Protected endpoint with rate limiting',
      '/api/scan': 'Run security scan with GeneGuard',
      '/api/health': 'Health check (no rate limit)'
    }
  });
});

// Protected endpoint with rate limiting
app.get('/api/data', rateLimitMiddleware, (req: Request, res: Response) => {
  res.json({
    message: 'Success! This endpoint is protected by rate limiting.',
    timestamp: new Date().toISOString(),
    data: {
      items: ['item1', 'item2', 'item3']
    }
  });
});

// Security scan endpoint
app.get('/api/scan', (req: Request, res: Response) => {
  try {
    const scanPath = req.query.path as string || './node_modules';
    const guard = new GeneGuard(scanPath);
    const findings = guard.run();
    
    res.json({
      message: 'Security scan completed',
      scanPath,
      findings: findings.slice(0, 10), // Limit to first 10 findings
      totalFindings: findings.length
    });
  } catch (error) {
    res.status(500).json({
      error: 'Scan failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Health check (no rate limit)
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ==========================================
// 3. Advanced: Per-User Rate Limiting
// ==========================================

const userLimiter = new SmartRateLimiter<number>({
  windowMs: 3600_000,  // 1 hour
  limit: 100,
  punishmentMs: 300_000 // 5 minutes
});

app.get('/api/user/:userId/data', (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId, 10);
  
  if (isNaN(userId)) {
    res.status(400).json({ error: 'Invalid user ID' });
    return;
  }
  
  const result = userLimiter.check(userId);
  
  res.setHeader('X-RateLimit-Remaining', result.remaining.toString());
  res.setHeader('X-RateLimit-Reset', result.resetAt.toISOString());
  
  if (!result.allowed) {
    res.status(429).json({
      error: 'User rate limit exceeded',
      resetAt: result.resetAt
    });
    return;
  }
  
  res.json({
    userId,
    message: 'User-specific data',
    remaining: result.remaining
  });
});

// ==========================================
// 4. Error Handler
// ==========================================

app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// ==========================================
// 5. Start Server
// ==========================================

app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log('\n📋 Available endpoints:');
  console.log(`   GET  /                     - API info`);
  console.log(`   GET  /api/data             - Protected endpoint (10 req/min)`);
  console.log(`   GET  /api/scan?path=./     - Security scan`);
  console.log(`   GET  /api/health           - Health check`);
  console.log(`   GET  /api/user/:id/data    - Per-user rate limit (100 req/hr)`);
  console.log('\n💡 Test rate limiting:');
  console.log(`   for i in {1..15}; do curl http://localhost:${PORT}/api/data; echo ""; done\n`);
});
