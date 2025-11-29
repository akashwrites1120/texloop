import { NextRequest, NextResponse } from "next/server";

interface RateLimitStore {
  [key: string]: {
    count: number;
    lastReset: number;
  };
}

const store: RateLimitStore = {};

// Clean up store every hour to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const key in store) {
    if (now - store[key].lastReset > 3600000) {
      delete store[key];
    }
  }
}, 3600000);

/**
 * Basic in-memory rate limiter
 * @param request NextRequest
 * @param limit Max requests per window
 * @param windowMs Window size in milliseconds
 * @returns Response if limited, null if allowed
 */
export function rateLimit(
  request: NextRequest,
  limit: number = 20,
  windowMs: number = 60000
): NextResponse | null {
  const ip =
    (request as any).ip || request.headers.get("x-forwarded-for") || "unknown";
  const now = Date.now();

  if (!store[ip]) {
    store[ip] = {
      count: 0,
      lastReset: now,
    };
  }

  const record = store[ip];

  // Reset if window passed
  if (now - record.lastReset > windowMs) {
    record.count = 0;
    record.lastReset = now;
  }

  record.count++;

  if (record.count > limit) {
    return NextResponse.json(
      { success: false, error: "Too many requests, please try again later." },
      { status: 429 }
    );
  }

  return null;
}
