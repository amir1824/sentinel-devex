
export interface LogGuardConfig {
  sensitiveKeys: string[];
  maxLogsPerMinute: number;
  enabled: boolean;
}

export class LogGuard {
  private originalConsoleLog: (...args: unknown[]) => void;
  private logTimestamps: number[] = []; 
  private isPaused: boolean = false;

  constructor(private readonly config: LogGuardConfig) {
    this.originalConsoleLog = console.log.bind(console);
    
    if (this.config.enabled) {
      this.init();
    }
  }


  private init(): void {
    console.log = (...args: unknown[]) => {
      if (this.checkFlooding()) {
        if (!this.isPaused) {
          this.isPaused = true;
          this.originalConsoleLog(
            `%c 🛑 LogGuard: Console paused for 1 minute due to flooding (>${this.config.maxLogsPerMinute} logs/min).`,
            'color: red; font-weight: bold;'
          );
        }
        return;
      }

      this.isPaused = false;

      const visitedRefs = new WeakSet<object>();
      
      const safeArgs = args.map(arg => this.sanitize(arg, visitedRefs));

      this.originalConsoleLog(...safeArgs);
    };

    this.originalConsoleLog(
      `%c 🛡️ LogGuard Active: Protecting against PII & Flooding`,
      'color: green; font-weight: bold;'
    );
  }


  private checkFlooding(): boolean {
    const now = Date.now();
    const windowStart = now - 60000; 

    while (this.logTimestamps.length > 0 && this.logTimestamps[0] <= windowStart) {
      this.logTimestamps.shift();
    }

    if (this.logTimestamps.length >= this.config.maxLogsPerMinute) {
      return true;
    }

    this.logTimestamps.push(now);
    return false;
  }

 
  private sanitize<T>(input: T, visited: WeakSet<object>): T {
    if (typeof input !== 'object' || input === null) {
      return input;
    }

 
    if (visited.has(input as object)) {
      return '[Circular Reference]' as unknown as T;
    }
    visited.add(input as object);

    if (Array.isArray(input)) {
      return input.map(item => this.sanitize(item, visited)) as unknown as T;
    }

    const copy = { ...(input as Record<string, unknown>) };

    for (const key of Object.keys(copy)) {
      const lowerKey = key.toLowerCase();
      
      const isSensitive = this.config.sensitiveKeys.some(sensitive => 
        lowerKey.includes(sensitive.toLowerCase())
      );

      if (isSensitive) {
        copy[key] = '*** [REDACTED BY LOGGUARD] ***';
      } else {
        copy[key] = this.sanitize(copy[key], visited);
      }
    }

    return copy as T;
  }

  public restore(): void {
    console.log = this.originalConsoleLog;
  }
}