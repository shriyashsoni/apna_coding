import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware to handle social media crawler previews for a Vite SPA.
 * Detects bots (WhatsApp, Telegram, Twitter, etc.) and rewrites their requests
 * to an API route that serves server-rendered Open Graph meta tags.
 */
export function middleware(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') || '';
  
  // List of common social media and search engine crawlers
  const bots = [
    'WhatsApp',
    'TelegramBot',
    'Twitterbot',
    'facebookexternalhit',
    'Slackbot',
    'Discordbot',
    'LinkedInBot',
    'Pinterestbot',
    'Googlebot',
    'Bingbot',
    'SkypeUriPreview',
    'X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36' // Some bots use generic UA
  ];

  const isBot = bots.some(bot => userAgent.includes(bot));
  const { pathname } = request.nextUrl;

  // Define paths that have dynamic content (hackathons, jobs, news, etc.)
  const dynamicPaths = [
    '/hackathons/',
    '/events/',
    '/event-groups/',
    '/jobs/',
    '/products/',
    '/news/',
    '/community/',
    '/verify/'
  ];

  const isDynamicPath = dynamicPaths.some(p => pathname.startsWith(p));

  // If it's a bot hitting a dynamic path, rewrite to the OG preview generator
  if (isBot && isDynamicPath) {
    const url = request.nextUrl.clone();
    url.pathname = '/api/og-preview';
    url.searchParams.set('path', pathname);
    return NextResponse.rewrite(url);
  }

  // Otherwise, continue as normal (Vite SPA handles the rest)
  return NextResponse.next();
}

// Optimization: Only run middleware on relevant paths
export const config = {
  matcher: [
    '/hackathons/:path*',
    '/events/:path*',
    '/event-groups/:path*',
    '/jobs/:path*',
    '/products/:path*',
    '/news/:path*',
    '/community/:path*',
    '/verify/:path*'
  ],
};
