/**
 * Simple in-memory rate limiter for socket connections and API routes
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Clean up expired entries every minute
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.limits.entries()) {
        if (now > entry.resetTime) {
          this.limits.delete(key);
        }
      }
    }, 60000);
  }

  /**
   * Check if a request should be rate limited
   * @param identifier - Unique identifier (e.g., IP address, user ID, socket ID)
   * @param maxRequests - Maximum number of requests allowed
   * @param windowMs - Time window in milliseconds
   * @returns true if rate limit exceeded, false otherwise
   */
  isRateLimited(
    identifier: string,
    maxRequests: number = 10,
    windowMs: number = 60000
  ): boolean {
    const now = Date.now();
    const entry = this.limits.get(identifier);

    if (!entry || now > entry.resetTime) {
      // Create new entry
      this.limits.set(identifier, {
        count: 1,
        resetTime: now + windowMs,
      });
      return false;
    }

    if (entry.count >= maxRequests) {
      return true;
    }

    // Increment count
    entry.count++;
    return false;
  }

  /**
   * Reset rate limit for a specific identifier
   */
  reset(identifier: string): void {
    this.limits.delete(identifier);
  }

  /**
   * Clean up and stop the rate limiter
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.limits.clear();
  }
}

// Export singleton instance
export const rateLimiter = new RateLimiter();

// Export for API routes
export function checkRateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60000
): { limited: boolean; remaining: number } {
  const limited = rateLimiter.isRateLimited(identifier, maxRequests, windowMs);
  const entry = rateLimiter["limits"].get(identifier);
  const remaining = entry
    ? Math.max(0, maxRequests - entry.count)
    : maxRequests;

  return { limited, remaining };
}
