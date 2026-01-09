
export interface LimiterConfig {
  windowMs: number;       
  limit: number;          
  punishmentMs?: number;  
}


interface ClientState {
  timestamps: number[];   
  blockedUntil: number;   
  violationCount: number; 
}


export interface RateLimitResult {
  allowed: boolean;       
  remaining: number;      
  resetAt: Date;          
  totalRequests: number;  
}

export class SmartRateLimiter<K = string> {
  private readonly state = new Map<K, ClientState>();

  constructor(private readonly config: LimiterConfig) {
    setInterval(() => this.cleanup(), 60 * 1000); 
  }

  
  public check(key: K): RateLimitResult {
    const now = Date.now();
    const state = this.getClientState(key);

    if (now < state.blockedUntil) {
      return this.buildResult(false, 0, state.blockedUntil, state.timestamps.length);
    }

    
    const windowStart = now - this.config.windowMs;
    
    while (state.timestamps.length > 0 && state.timestamps[0] <= windowStart) {
      state.timestamps.shift(); 
    }

    if (state.timestamps.length >= this.config.limit) {
      return this.applyPunishment(state, now);
    }

    state.timestamps.push(now);
    if (state.violationCount > 0 && state.timestamps.length === 1) { 
        state.violationCount = 0; 
    }

    const oldestRequest = state.timestamps[0] || now;
    const resetTime = oldestRequest + this.config.windowMs;

    return this.buildResult(
      true, 
      this.config.limit - state.timestamps.length, 
      resetTime, 
      state.timestamps.length
    );
  }

 
  private getClientState(key: K): ClientState {
    if (!this.state.has(key)) {
      this.state.set(key, { timestamps: [], blockedUntil: 0, violationCount: 0 });
    }
    return this.state.get(key)!;
  }

  
  private applyPunishment(state: ClientState, now: number): RateLimitResult {
    state.violationCount++;
    
   
    const baseBlockTime = this.config.punishmentMs || 0;
    const blockDuration = baseBlockTime > 0 
      ? baseBlockTime * Math.pow(2, state.violationCount - 1) 
      : 0;

    const nextFreeSlot = (state.timestamps[0] || now) + this.config.windowMs;
    state.blockedUntil = Math.max(now + blockDuration, nextFreeSlot);

    return this.buildResult(false, 0, state.blockedUntil, state.timestamps.length);
  }

  private buildResult(allowed: boolean, remaining: number, resetTs: number, total: number): RateLimitResult {
    return {
      allowed,
      remaining,
      resetAt: new Date(resetTs),
      totalRequests: total
    };
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, state] of this.state.entries()) {
      if (state.blockedUntil < now && (state.timestamps.length === 0 || state.timestamps[state.timestamps.length - 1] < now - this.config.windowMs)) {
        this.state.delete(key);
      }
    }
  }
}