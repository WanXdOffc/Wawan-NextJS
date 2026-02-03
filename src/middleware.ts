import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const ddosMap = new Map<string, RateLimitEntry>();
const apiRateLimitMap = new Map<string, RateLimitEntry>();
const spamRateLimitMap = new Map<string, RateLimitEntry>();

const DDOS_LIMIT = 1000;
const DDOS_WINDOW_MS = 60 * 60 * 1000;

let cachedApiRateLimit = 100;
let cachedApiWindowHours = 1;
let cachedSpamLimit = 5;
let cachedSpamWindowSeconds = 5;
let lastSettingsFetch = 0;
const SETTINGS_CACHE_MS = 30000;

const API_ENDPOINTS = [
  '/api/ai/',
  '/api/anime',
  '/api/dl/',
  '/api/spotify/',
  '/api/spotify',
  '/api/tools/',
  '/api/search/',
  '/api/novel/',
  '/api/identitas',
  '/api-docs',
];

interface AnalyticsBuffer {
  data: Array<{
    type: string;
    path: string;
    method: string;
    ip: string;
    userAgent: string;
    referer: string;
    statusCode?: number;
    responseTime?: number;
    timestamp: Date;
  }>;
  lastFlush: number;
}

const analyticsBuffer: AnalyticsBuffer = {
  data: [],
  lastFlush: Date.now()
};

const BUFFER_SIZE = 10;
const BUFFER_FLUSH_INTERVAL = 5000;

function getClientIP(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  
  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  
  return 'unknown';
}

function cleanupExpiredEntries() {
  const now = Date.now();
  for (const [key, entry] of ddosMap.entries()) {
    if (now > entry.resetTime) {
      ddosMap.delete(key);
    }
  }
  for (const [key, entry] of apiRateLimitMap.entries()) {
    if (now > entry.resetTime) {
      apiRateLimitMap.delete(key);
    }
  }
  for (const [key, entry] of spamRateLimitMap.entries()) {
    if (now > entry.resetTime) {
      spamRateLimitMap.delete(key);
    }
  }
}

function isPublicApiEndpoint(pathname: string): boolean {
  return API_ENDPOINTS.some(endpoint => pathname.startsWith(endpoint));
}

async function flushAnalytics(baseUrl: string) {
  if (analyticsBuffer.data.length === 0) return;
  
  const dataToSend = [...analyticsBuffer.data];
  analyticsBuffer.data = [];
  analyticsBuffer.lastFlush = Date.now();
  
  try {
    await fetch(`${baseUrl}/api/analytics-track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events: dataToSend }),
    });
  } catch {
    analyticsBuffer.data.push(...dataToSend);
  }
}

function trackAnalytics(request: NextRequest, type: 'api_request' | 'page_view', statusCode?: number, responseTime?: number) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
             request.headers.get('x-real-ip') || 'unknown';
  
  analyticsBuffer.data.push({
    type,
    path: request.nextUrl.pathname,
    method: request.method,
    ip,
    userAgent: request.headers.get('user-agent') || '',
    referer: request.headers.get('referer') || '',
    statusCode,
    responseTime,
    timestamp: new Date()
  });
  
  const shouldFlush = analyticsBuffer.data.length >= BUFFER_SIZE || 
                      (Date.now() - analyticsBuffer.lastFlush) > BUFFER_FLUSH_INTERVAL;
  
  if (shouldFlush) {
    flushAnalytics(request.nextUrl.origin);
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const startTime = Date.now();
  
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.') ||
    pathname.startsWith('/api/settings') ||
    pathname.startsWith('/api/admin') ||
    pathname === '/api/analytics-track'
  ) {
    return NextResponse.next();
  }

  const clientIP = getClientIP(request);
  const now = Date.now();

  let ddosEntry = ddosMap.get(clientIP);
  
  if (!ddosEntry || now > ddosEntry.resetTime) {
    ddosEntry = {
      count: 0,
      resetTime: now + DDOS_WINDOW_MS,
    };
    ddosMap.set(clientIP, ddosEntry);
  }
  
  ddosEntry.count++;
  
  if (ddosEntry.count > DDOS_LIMIT) {
    const retryAfter = Math.ceil((ddosEntry.resetTime - now) / 1000);
    
    return new NextResponse(
      JSON.stringify({
        error: 'Too Many Requests',
        message: `Anti-DDoS: Maximum ${DDOS_LIMIT} requests per hour allowed.`,
        retryAfter,
        type: 'ddos_protection',
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': retryAfter.toString(),
        },
      }
    );
  }

  const isApiRequest = pathname.startsWith('/api/');
  const isPageRequest = !isApiRequest && !pathname.includes('.');

  if (isPublicApiEndpoint(pathname)) {
    if (now - lastSettingsFetch > SETTINGS_CACHE_MS) {
      try {
        const settingsUrl = new URL('/api/settings/rate-limit', request.url);
        const settingsResponse = await fetch(settingsUrl.toString(), {
          method: 'GET',
          headers: { 'x-internal-request': 'true' },
        });
        
        if (settingsResponse.ok) {
          const settings = await settingsResponse.json();
          if (settings.rateLimit) {
            cachedApiRateLimit = settings.rateLimit;
          }
          if (settings.windowHours) {
            cachedApiWindowHours = settings.windowHours;
          }
          if (settings.spamLimit) {
            cachedSpamLimit = settings.spamLimit;
          }
          if (settings.spamWindowSeconds) {
            cachedSpamWindowSeconds = settings.spamWindowSeconds;
          }
          lastSettingsFetch = now;
        }
      } catch {
      }
    }

    // --- ANTI-SPAM CHECK ---
    const spamWindowMs = cachedSpamWindowSeconds * 1000;
    const spamKey = `${clientIP}:spam`;
    let spamEntry = spamRateLimitMap.get(spamKey);

    if (!spamEntry || now > spamEntry.resetTime) {
      spamEntry = {
        count: 0,
        resetTime: now + spamWindowMs,
      };
      spamRateLimitMap.set(spamKey, spamEntry);
    }

    spamEntry.count++;

    if (spamEntry.count > cachedSpamLimit) {
      const retryAfter = Math.ceil((spamEntry.resetTime - now) / 1000);
      return new NextResponse(
        JSON.stringify({
          error: 'Too Many Requests',
          message: `Anti-Spam: Please wait a few seconds before another request. (Max ${cachedSpamLimit} requests per ${cachedSpamWindowSeconds}s)`,
          retryAfter,
          type: 'anti_spam',
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': retryAfter.toString(),
          },
        }
      );
    }
    // --- END ANTI-SPAM ---
    
    const apiWindowMs = cachedApiWindowHours * 60 * 60 * 1000;
    const apiKey = `${clientIP}:api`;
    let apiEntry = apiRateLimitMap.get(apiKey);
    
    if (!apiEntry || now > apiEntry.resetTime) {
      apiEntry = {
        count: 0,
        resetTime: now + apiWindowMs,
      };
      apiRateLimitMap.set(apiKey, apiEntry);
    }
    
    apiEntry.count++;
    
    if (apiEntry.count > cachedApiRateLimit) {
      const retryAfter = Math.ceil((apiEntry.resetTime - now) / 1000);
      
      return new NextResponse(
        JSON.stringify({
          error: 'Too Many Requests',
          message: `API Rate limit exceeded. Maximum ${cachedApiRateLimit} requests per ${cachedApiWindowHours} hour(s) allowed.`,
          retryAfter,
          type: 'api_rate_limit',
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': cachedApiRateLimit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': apiEntry.resetTime.toString(),
          },
        }
      );
    }
    
    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', cachedApiRateLimit.toString());
    response.headers.set('X-RateLimit-Remaining', Math.max(0, cachedApiRateLimit - apiEntry.count).toString());
    response.headers.set('X-RateLimit-Reset', apiEntry.resetTime.toString());
    
    trackAnalytics(request, 'api_request', 200, Date.now() - startTime);
    
    if (Math.random() < 0.01) {
      cleanupExpiredEntries();
    }
    
    return response;
  }

  if (isPageRequest) {
    trackAnalytics(request, 'page_view');
  }

  if (Math.random() < 0.01) {
    cleanupExpiredEntries();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|icons).*)',
  ],
};

