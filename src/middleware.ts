import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple in-memory edge rate limiter. Helps mitigate simple flooding.
const requestMap = new Map<string, { count: number; lastReset: number }>();
const LIMIT = 100; // max requests
const WINDOW = 60 * 1000; // per 1 minute

export function middleware(request: NextRequest) {
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  const ua = request.headers.get('user-agent')?.toLowerCase() || '';

  // 1. Basic Bot/Scraper Protection based on UA
  const suspiciousAgents = ['python-requests', 'curl', 'wget', 'urllib', 'scrapy'];
  if (suspiciousAgents.some(agent => ua.includes(agent))) {
    return new NextResponse('Access Denied. Suspicious automated traffic detected.', { status: 403 });
  }

  // 2. IP Rate Limiting
  if (ip !== 'unknown') {
    const now = Date.now();
    const entry = requestMap.get(ip) || { count: 0, lastReset: now };

    if (now - entry.lastReset > WINDOW) {
      entry.count = 1;
      entry.lastReset = now;
    } else {
      entry.count++;
      if (entry.count > LIMIT) {
        return new NextResponse('Too Many Requests. Rate limiting enabled.', { status: 429 });
      }
    }
    
    requestMap.set(ip, entry);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
